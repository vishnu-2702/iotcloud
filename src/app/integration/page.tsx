
"use client"
import * as React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Code, Cpu, LayoutGrid, Wind } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from 'lucide-react'

const arduinoCode = `
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h> // Correct include for HTTPS
#include <ArduinoJson.h>      // Use the standard, robust ArduinoJson library

// --- WIFI and API Configuration ---
const char* ssid = "VISHNU";
const char* password = "12345678";

// --- Server Configuration ---
// IMPORTANT: ngrok free tier URLs expire. Before running, ensure this URL
// is still active in your ngrok terminal. If not, update it here.
const char* serverUrl = "https://iotcloud-prd9.vercel.app/api/telemetry";

// --- Device Configuration ---
const char* deviceId = "dev-ko9ifcj";
const char* apiKey = "ak-1f45b595-1567-432a-bb10-5f93c1938efb";

// --- Global Objects for Stability ---
// Declaring these globally prevents memory fragmentation and crashes.
WiFiClientSecure client;
HTTPClient http;

// --- Timing and Simulation Variables ---
unsigned long lastTime = 0;
const unsigned long timerDelay = 10000; // Send data every 10 seconds
float baseTemperature = 22.0;
float baseHumidity = 55.0;
unsigned long startTime;

// Forward declaration of functions
float generateTemperature();
float generateHumidity(float currentTemperature);
void sendTelemetryData(float temperature, float humidity);

void setup() {
  Serial.begin(115200);
  delay(10);

  // --- Configure for HTTPS ---
  // This is for testing purposes. It bypasses the server's certificate validation.
  client.setInsecure();

  // --- Connect to Wi-Fi ---
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected! IP Address: ");
  Serial.println(WiFi.localIP());

  startTime = millis();
}

void loop() {
  // Send an HTTP POST request based on the timerDelay
  if ((millis() - lastTime) > timerDelay) {
    if (WiFi.status() == WL_CONNECTED) {
      // Generate simulated sensor values
      float temperature = generateTemperature();
      float humidity = generateHumidity(temperature); // Pass temp for better simulation

      // Send the data
      sendTelemetryData(temperature, humidity);
    } else {
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
}

float generateTemperature() {
  unsigned long currentTime = millis();
  float timeInHours = (currentTime - startTime) / 3600000.0;
  float dailyCycle = 5.0 * sin(2 * PI * timeInHours / 24.0);
  float randomVariation = (random(-100, 101) / 100.0) * 2.0;
  float temperature = baseTemperature + dailyCycle + randomVariation;
  return constrain(temperature, 15.0, 35.0);
}

float generateHumidity(float currentTemperature) {
  float temperatureFactor = -0.5 * (currentTemperature - baseTemperature);
  float randomVariation = (random(-100, 101) / 100.0) * 8.0;
  float humidity = baseHumidity + temperatureFactor + randomVariation;
  return constrain(humidity, 20.0, 90.0);
}

void sendTelemetryData(float temperature, float humidity) {
  Serial.println("\n--- New Request ---");

  // Begin the HTTP connection
  if (http.begin(client, serverUrl)) {
    // Add all necessary headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("ngrok-skip-browser-warning", "true"); // CRITICAL for ngrok
    http.addHeader("User-Agent", "ESP8266-Telemetry/1.0");

    // Create JSON payload using ArduinoJson for reliability
    DynamicJsonDocument doc(256);
    doc["deviceId"] = deviceId;
    doc["apiKey"] = apiKey;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;

    String requestBody;
    serializeJson(doc, requestBody);

    Serial.println("Sending data:");
    Serial.println(requestBody);

    // Send the POST request
    int httpResponseCode = http.POST(requestBody);

    // Handle the response
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.print("Server response: ");
      Serial.println(response);
    } else {
      Serial.print("Error sending POST. HTTP Code: ");
      Serial.println(httpResponseCode);
      Serial.printf("HTTPClient error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    // Free resources
    http.end();
  } else {
    Serial.println("!!! FAILED to begin HTTP connection. Check URL and memory. !!!");
  }
  Serial.println("--------------------");
}

`;

export default function IntegrationPage() {
    
    return (
        <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
            <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                <Wind className="text-primary h-6 w-6" />
                <h1 className="text-lg font-semibold">AetherControl</h1>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/" className="w-full">
                        <SidebarMenuButton>
                        <LayoutGrid />
                        Dashboard
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/integration" className="w-full">
                        <SidebarMenuButton isActive>
                        <Code />
                        API Integration
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/devices" className="w-full">
                        <SidebarMenuButton>
                        <Cpu />
                        All Devices
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            </Sidebar>

            <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                <h1 className="text-xl font-semibold">API Integration</h1>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-4 sm:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Connecting Your Devices</CardTitle>
                        <CardDescription>
                            Follow these instructions to send data from your IoT devices to the AetherControl dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                           <h3 className="font-semibold text-lg">1. Find Your Server URL</h3>
                           <p className="text-muted-foreground">Your devices send data to the `/api/telemetry` endpoint. The full URL depends on where the application is running.</p>
                           
                           <Alert>
                               <Terminal className="h-4 w-4" />
                               <AlertTitle>Local Development</AlertTitle>
                               <AlertDescription>
                                   If you are running this app locally (using `npm run dev`), you must use your computer's local IP address. Your ESP8266 must be on the same WiFi network. For example:
                                   <pre className="mt-2 p-2 bg-muted rounded-md text-sm"><code>http://192.168.1.100:9002/api/telemetry</code></pre>
                               </AlertDescription>
                           </Alert>

                           <Alert variant="destructive">
                               <Terminal className="h-4 w-4" />
                               <AlertTitle>Deployed Application</AlertTitle>
                               <AlertDescription>
                                   Once you deploy this application to a hosting service (like Firebase App Hosting, Vercel, etc.), you must use the public URL provided by that service. For example:
                                   <pre className="mt-2 p-2 bg-destructive/20 rounded-md text-sm"><code>https://your-app-name.apphosting.dev/api/telemetry</code></pre>
                               </AlertDescription>
                           </Alert>
                        </div>

                         <div className="space-y-2">
                           <h3 className="font-semibold text-lg">2. Structure Your Data (JSON)</h3>
                           <p className="text-muted-foreground">The body of the POST request must be a JSON object. Remember to uncomment the data fields in the example code that correspond to your chosen widget.</p>
                           <pre className="p-2 bg-muted rounded-md text-sm">
{`{
  "deviceId": "YOUR_DEVICE_ID_FROM_DASHBOARD",
  "apiKey": "YOUR_API_KEY_FROM_DASHBOARD",

  // --- Choose fields based on widget type ---
  "temperature": 25.5,    // For temp-humidity
  "humidity": 60.0,       // For temp-humidity
  "light_level": 812,     // For light-sensor
  "isOn": true            // For switch
}`}
                           </pre>
                        </div>
                        <div className="space-y-2">
                           <h3 className="font-semibold text-lg">3. Example ESP8266 Code (Arduino)</h3>
                           <p className="text-muted-foreground">Here is a complete example for sending data from an ESP8266. You will need the <code className="text-xs bg-muted p-1 rounded">ArduinoJson</code> library (version 6 or newer). Make sure to fill in your WiFi credentials, server URL, device ID, and API key.</p>
                           <div className="max-h-[500px] overflow-auto rounded-md border">
                            <pre className="p-4 bg-muted text-sm">{arduinoCode}</pre>
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
            </SidebarInset>
        </div>
        </SidebarProvider>
    )
}
