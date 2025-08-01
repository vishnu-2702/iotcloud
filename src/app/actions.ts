
"use server";

import { analyzeTelemetry as analyzeTelemetryFlow } from "@/ai/flows/analyze-telemetry";
import type { AnalyzeTelemetryInput, AnalyzeTelemetryOutput } from "@/ai/flows/analyze-telemetry";
import { firestore } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export async function analyzeTelemetryAction(
  input: AnalyzeTelemetryInput
): Promise<AnalyzeTelemetryOutput> {
  try {
    const result = await analyzeTelemetryFlow(input);
    return result;
  } catch (error) {
    console.error("Error analyzing telemetry:", error);
    // In a real app, you'd want more robust error handling
    return {
      analysisResult: "An error occurred while analyzing the telemetry data. Please try again later.",
    };
  }
}


export async function deleteDeviceAction(deviceId: string): Promise<void> {
  try {
    const deviceRef = doc(firestore, "devices", deviceId);
    await deleteDoc(deviceRef);
  } catch (error) {
    console.error("Error deleting device:", error);
    // Re-throw the error to be handled by the calling function
    throw new Error("Failed to delete device from server.");
  }
}
