
"use client";

import * as React from "react";
import {
  Cpu,
  LayoutGrid,
  PlusCircle,
  TriangleAlert,
  Wind,
  Code,
} from "lucide-react";
import Link from "next/link";
import { collection, onSnapshot, query, doc, updateDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

import type { Device, Group } from "@/lib/types";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

import DeviceCard from "@/components/aether-control/device-card";
import DeviceRegistrationForm from "@/components/aether-control/device-registration-form";

export default function AetherControlPage() {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = React.useState<string>("all");
  const [isRegisterOpen, setRegisterOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();


  React.useEffect(() => {
    const devicesQuery = query(collection(firestore, "devices"));
    const unsubscribe = onSnapshot(devicesQuery, (querySnapshot) => {
      const devicesData: Device[] = [];
      const groupsData: Group[] = [];
      const groupSet = new Set<string>();

      querySnapshot.forEach((doc) => {
        const device = { id: doc.id, ...doc.data() } as Device;
        devicesData.push(device);
        if (device.group && !groupSet.has(device.group)) {
          groupSet.add(device.group);
          groupsData.push({ id: device.group, name: device.group });
        }
      });
      setDevices(devicesData);
      setGroups(groupsData.sort((a,b) => a.name.localeCompare(b.name)));
      setIsLoading(false);
      setError(null);
    }, (error) => {
        console.error("Error fetching devices:", error);
        setError("Failed to fetch devices. Please check your connection and Firebase setup.");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRegisterDevice = async (newDeviceData: Omit<Device, 'isOnline' | 'telemetry' | 'telemetryHistory'>) => {
    const newDevice: Device = {
      ...newDeviceData,
      isOnline: false,
      isOn: false,
      telemetry: {
        temperature: 0,
        humidity: 0,
        pressure: 0,
        timestamp: Date.now(),
        light_level: 0,
      },
      telemetryHistory: [],
    };
    
    await setDoc(doc(firestore, "devices", newDeviceData.id), newDevice);
    toast({
        title: "Device Registered!",
        description: `Device ID: ${newDeviceData.id} | API Key: ${newDeviceData.key}`,
    });
  };

  const toggleDevicePower = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
        const deviceRef = doc(firestore, "devices", deviceId);
        await updateDoc(deviceRef, {
            isOn: !device.isOn
        });
    }
  };
  
  const filteredDevices =
    activeGroup === "all"
      ? devices
      : devices.filter((d) => d.group === activeGroup);

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
                    <SidebarMenuButton isActive>
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
            <div className="mt-4 p-2">
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                Device Groups
              </h3>
              <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveGroup("all")} isActive={activeGroup === 'all'}>
                        All Groups
                    </SidebarMenuButton>
                </SidebarMenuItem>
                {groups.map((group) => (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton onClick={() => setActiveGroup(group.id)} isActive={activeGroup === group.id}>
                      {group.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <Dialog open={isRegisterOpen} onOpenChange={setRegisterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Register Device</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register a New Device</DialogTitle>
                </DialogHeader>
                <DeviceRegistrationForm onRegister={handleRegisterDevice} onFinished={() => setRegisterOpen(false)}/>
              </DialogContent>
            </Dialog>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6">
             {error && (
                <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/10 text-destructive">
                    <TriangleAlert className="h-10 w-10 mb-4" />
                    <h2 className="text-lg font-semibold">An Error Occurred</h2>
                    <p>{error}</p>
                </div>
            )}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i}><CardHeader><div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div><div className="h-4 bg-muted rounded w-1/2 animate-pulse mt-2"></div></CardHeader><CardContent><div className="h-24 bg-muted rounded animate-pulse"></div></CardContent><CardFooter><div className="h-10 bg-muted rounded w-full animate-pulse"></div></CardFooter></Card>
                    ))}
                </div>
            ) : !error && (
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredDevices.map((device) => (
                    <DeviceCard
                        key={device.id}
                        device={device}
                        onTogglePower={toggleDevicePower}
                      />
                  ))}
                </div>
            )}
           
            {!isLoading && !error && devices.length === 0 && (
                <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                    <Cpu className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No devices registered yet.</p>
                    <Dialog open={isRegisterOpen} onOpenChange={setRegisterOpen}>
                      <DialogTrigger asChild>
                         <Button variant="link">Register your first device</Button>
                      </DialogTrigger>
                       <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Register a New Device</DialogTitle>
                        </DialogHeader>
                        <DeviceRegistrationForm onRegister={handleRegisterDevice} onFinished={() => setRegisterOpen(false)} />
                      </DialogContent>
                    </Dialog>
                </div>
            )}
             {!isLoading && !error && devices.length > 0 && filteredDevices.length === 0 && (
                <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">No devices in this group.</p>
                    <Button variant="link" onClick={() => setActiveGroup('all')}>View all devices</Button>
                </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
