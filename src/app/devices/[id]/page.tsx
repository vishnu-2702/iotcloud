
"use client";

import * as React from "react";
import {
  Cpu,
  LayoutGrid,
  Wind,
  Code,
  TriangleAlert,
  LoaderCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

import type { Device } from "@/lib/types";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import DeviceCard from "@/components/aether-control/device-card";

export default function SingleDevicePage({ params }: { params: { id: string } }) {
  const [device, setDevice] = React.useState<Device | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!params.id) return;

    const deviceRef = doc(firestore, "devices", params.id);
    const unsubscribe = onSnapshot(deviceRef, (docSnap) => {
      if (docSnap.exists()) {
        setDevice({ id: docSnap.id, ...docSnap.data() } as Device);
        setError(null);
      } else {
        setError("Device not found.");
        setDevice(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching device:", err);
      setError("Failed to fetch device data.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [params.id]);

  const toggleDevicePower = async (deviceId: string) => {
    if (device) {
        const deviceRef = doc(firestore, "devices", deviceId);
        await updateDoc(deviceRef, {
            isOn: !device.isOn
        });
    }
  };

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
                    <SidebarMenuButton>
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
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Back to Dashboard</span>
                </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">
                {isLoading ? "Loading..." : device?.name ?? "Device Details"}
              </h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="mx-auto max-w-md">
                {isLoading ? (
                    <div className="flex items-center justify-center text-muted-foreground py-16">
                        <LoaderCircle className="h-8 w-8 animate-spin mr-3" />
                        Loading device...
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-destructive bg-destructive/10 border-2 border-dashed border-destructive/50 rounded-lg py-16">
                        <TriangleAlert className="h-10 w-10 mb-4" />
                        <h2 className="text-lg font-semibold">An Error Occurred</h2>
                        <p>{error}</p>
                    </div>
                ) : device ? (
                    <DeviceCard
                        device={device}
                        onTogglePower={toggleDevicePower}
                    />
                ) : (
                    <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                        <Cpu className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h2 className="mt-4 text-lg font-semibold">Device Not Found</h2>
                        <p className="mt-1 text-sm">The device you are looking for does not exist.</p>
                        <Button asChild variant="link" className="mt-2">
                            <Link href="/">Go to Dashboard</Link>
                        </Button>
                    </div>
                )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
