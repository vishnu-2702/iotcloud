
"use client";

import * as React from "react";
import {
  Cpu,
  LayoutGrid,
  PlusCircle,
  Wind,
  Code,
  Wifi,
  WifiOff,
  TriangleAlert,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { collection, onSnapshot, query, doc, setDoc } from "firebase/firestore";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import DeviceRegistrationForm from "@/components/aether-control/device-registration-form";
import { deleteDeviceAction } from "@/app/actions";

export default function AllDevicesPage() {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [isRegisterOpen, setRegisterOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const devicesQuery = query(collection(firestore, "devices"));
    const unsubscribe = onSnapshot(devicesQuery, (querySnapshot) => {
      const devicesData: Device[] = [];
      querySnapshot.forEach((doc) => {
        const device = { id: doc.id, ...doc.data() } as Device;
        devicesData.push(device);
      });
      setDevices(devicesData);
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

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      await deleteDeviceAction(deviceId);
      toast({
        title: "Device Deleted",
        description: `Device ${deviceId} has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting device:", error);
      toast({
        title: "Error",
        description: "Failed to delete the device. Please try again.",
        variant: "destructive",
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
                    <SidebarMenuButton isActive>
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
              <h1 className="text-xl font-semibold">All Devices</h1>
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
             {isLoading ? (
                <div className="flex items-center justify-center text-muted-foreground py-16">
                    <LoaderCircle className="h-8 w-8 animate-spin mr-3" />
                    Loading devices...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center text-destructive bg-destructive/10 border-2 border-dashed border-destructive/50 rounded-lg py-16">
                    <TriangleAlert className="h-10 w-10 mb-4" />
                    <h2 className="text-lg font-semibold">An Error Occurred</h2>
                    <p>{error}</p>
                </div>
            ) : devices.length === 0 ? (
                <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                    <Cpu className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h2 className="mt-4 text-lg font-semibold">No Devices Yet</h2>
                    <p className="mt-1 text-sm">Register your first device to see it here.</p>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Registered Devices</CardTitle>
                        <CardDescription>A list of all devices connected to your AetherControl account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Device Name</TableHead>
                            <TableHead>Device ID</TableHead>
                            <TableHead>API Key</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>Widget Type</TableHead>
                            <TableHead>Last Seen</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {devices.map((device) => (
                            <TableRow key={device.id}>
                              <TableCell>
                                 <Badge variant={device.isOnline ? "default" : "destructive"} className={cn(
                                    "capitalize text-xs whitespace-nowrap", 
                                    device.isOnline ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white",
                                    "hover:bg-green-500/90 hover:bg-red-500/90"
                                )}>
                                  {device.isOnline ? (
                                    <Wifi className="mr-1 h-3 w-3" />
                                  ) : (
                                    <WifiOff className="mr-1 h-3 w-3" />
                                  )}
                                  {device.isOnline ? "Online" : "Offline"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{device.name}</TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted p-1 rounded-sm">{device.id}</code>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted p-1 rounded-sm">{device.key}</code>
                              </TableCell>
                              <TableCell>{device.group}</TableCell>
                              <TableCell className="capitalize">{device.widgetType.replace('-', ' & ')}</TableCell>
                              <TableCell>{device.telemetry?.timestamp ? new Date(device.telemetry.timestamp).toLocaleString() : 'Never'}</TableCell>
                              <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the device
                                        and all of its telemetry data from our servers.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteDevice(device.id)}>
                                        Continue
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
