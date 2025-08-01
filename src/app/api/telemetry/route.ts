
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { firestore } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, writeBatch, arrayRemove } from 'firebase/firestore';
import type { Device, Telemetry } from '@/lib/types';


const telemetrySchema = z.object({
  deviceId: z.string(),
  apiKey: z.string(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  pressure: z.number().optional(),
  light_level: z.number().optional(),
  isOn: z.boolean().optional(),
});

const MAX_HISTORY_LENGTH = 50;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = telemetrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: validation.error.errors }, { status: 400, headers: corsHeaders });
    }
    
    const { deviceId, apiKey, ...telemetryData } = validation.data;

    const deviceRef = doc(firestore, "devices", deviceId);
    const deviceSnap = await getDoc(deviceRef);

    if (!deviceSnap.exists()) {
        return NextResponse.json({ message: 'Device not found' }, { status: 404, headers: corsHeaders });
    }

    const device = deviceSnap.data() as Device;

    if (device.key !== apiKey) {
        return NextResponse.json({ message: 'Invalid API Key' }, { status: 401, headers: corsHeaders });
    }
    
    const newTelemetry: Partial<Telemetry> = {
      ...telemetryData,
      timestamp: Date.now(),
    };
    
    const historyValue = 
      telemetryData.temperature ?? 
      telemetryData.humidity ?? 
      telemetryData.light_level ?? 
      (telemetryData.isOn !== undefined ? (telemetryData.isOn ? 1 : 0) : null);

    // Prepare updates
    const updates: any = {
      isOnline: true,
      ['telemetry.timestamp']: newTelemetry.timestamp
    };

    if (telemetryData.temperature !== undefined) updates['telemetry.temperature'] = telemetryData.temperature;
    if (telemetryData.humidity !== undefined) updates['telemetry.humidity'] = telemetryData.humidity;
    if (telemetryData.light_level !== undefined) updates['telemetry.light_level'] = telemetryData.light_level;
    if (telemetryData.isOn !== undefined) {
      updates['telemetry.isOn'] = telemetryData.isOn;
      updates['isOn'] = telemetryData.isOn;
    }
    
    // Create a batch for atomic writes
    const batch = writeBatch(firestore);

    // Smart history update
    if (historyValue !== null) {
      const historyEntry = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}),
          value: historyValue
      };
      
      const currentHistory = device.telemetryHistory || [];
      
      // Use arrayUnion to add the new entry
      updates.telemetryHistory = arrayUnion(historyEntry);

      // If history exceeds max length, prepare to remove the oldest entries
      if (currentHistory.length >= MAX_HISTORY_LENGTH) {
        const toRemove = currentHistory.slice(0, currentHistory.length - MAX_HISTORY_LENGTH + 1);
        // Chain arrayRemove operations for each old entry
        batch.update(deviceRef, { telemetryHistory: arrayRemove(...toRemove) });
      }
    }
    
    batch.update(deviceRef, updates);
    await batch.commit();

    return NextResponse.json({ message: 'Telemetry data received successfully.' }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error processing telemetry data:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500, headers: corsHeaders });
  }
}
