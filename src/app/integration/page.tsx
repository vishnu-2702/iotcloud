
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
#include <ArduinoJson.h> // Use ArduinoJson v6 or later

// --- WIFI and API Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// IMPORTANT: Replace with your deployed application URL
// For local development, you might use your computer's local IP address
// Example: "http://192.168.1.100:9002/api/telemetry"
const char* serverUrl = "YOUR_APP_URL/api/telemetry"; 

// --- Device Configuration ---
// IMPORTANT: Get these values from the AetherControl dashboard after registering your device
const char* deviceId = "YOUR_DEVICE_ID"; 
const char* apiKey = "YOUR_API_KEY";

void setup() {
  Serial.begin(115200);
  delay(10);

  // Connect to Wi-Fi
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    // --- Sensor Reading Logic ---
    // Replace these with your actual sensor reading functions
    float temperature = 25.5; // Example value, e.g., read from a DHT11/22
    float humidity = 60.0;    // Example value, e.g., read from a DHT11/22
    // float pressure = 1013.25; // Example for a BME280 sensor
    int light_level = 750;     // Example for a photoresistor/LDR
    bool switch_state = true;  // Example for a digital switch

    // --- JSON Payload Creation ---
    // This creates a JSON object to send to the server.
    // It's dynamically sized to be memory efficient.
    DynamicJsonDocument doc(256);

    // Add required fields
    doc["deviceId"] = deviceId;
    doc["apiKey"] = apiKey;

    // --- Add data based on your widget type ---
    // Uncomment the lines that match the widget you configured in the dashboard.
    
    // For "Temperature & Humidity" widget
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;

    // For "Light Sensor" widget
    // doc["light_level"] = light_level;

    // For "On/Off Switch" widget
    // doc["isOn"] = switch_state;
    
    String requestBody;
    serializeJson(doc, requestBody);

    Serial.print("Sending POST to server: ");
    Serial.println(requestBody);

    // --- Send POST request ---
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response: ");
      Serial.println(response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected. Retrying...");
  }

  // Send data every 30 seconds
  delay(30000); 
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
