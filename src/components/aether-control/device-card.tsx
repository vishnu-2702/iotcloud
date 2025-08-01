
"use client";

import * as React from "react";
import {
  BrainCircuit,
  Droplets,
  Lightbulb,
  Power,
  Thermometer,
  Wifi,
  WifiOff,
  Link as LinkIcon,
} from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import Link from 'next/link';

import type { Device } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TelemetryAnalysis from "@/components/aether-control/telemetry-analysis";

interface DeviceCardProps {
  device: Device;
  onTogglePower: (deviceId: string) => void;
  className?: string;
}

const chartConfig = {
  temperature: {
    label: "Temp",
    color: "hsl(var(--chart-1))",
  },
  humidity: {
    label: "Humidity",
    color: "hsl(var(--chart-2))",
  },
  light: {
    label: "Light",
    color: "hsl(var(--chart-4))",
  }
};

const renderWidget = (device: Device) => {
    const history = device.telemetryHistory?.slice(-30) || [];
    switch (device.widgetType) {
        case 'temp-humidity':
            return (
                <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Thermometer className="h-5 w-5 text-destructive" />
                            <div>
                                <p className="text-muted-foreground">Temperature</p>
                                <p className="font-semibold">
                                    {device.telemetry.temperature?.toFixed(1) ?? 'N/A'}°C
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Droplets className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-muted-foreground">Humidity</p>
                                <p className="font-semibold">
                                    {device.telemetry.humidity?.toFixed(1) ?? 'N/A'}%
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="h-24">
                       {history.length > 0 ? (
                         <ChartContainer config={chartConfig} className="h-full w-full">
                            <LineChart
                                data={history}
                                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                                accessibilityLayer
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <YAxis
                                    dataKey="value"
                                    domain={['dataMin - 2', 'dataMax + 2']}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={30}
                                />
                                <RechartsTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" hideLabel />}
                                />
                                <Line
                                    dataKey="value"
                                    type="monotone"
                                    stroke="hsl(var(--chart-1))"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                       ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No telemetry history</div>
                       )}
                    </div>
                </>
            );
        case 'light-sensor':
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-sm">
                        <Lightbulb className="h-6 w-6 text-yellow-400" />
                        <div>
                            <p className="text-muted-foreground">Light Level</p>
                            <p className="text-2xl font-bold">{device.telemetry.light_level ?? 0} lm</p>
                        </div>
                    </div>
                     <div className="h-24">
                        {history.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <LineChart
                                accessibilityLayer
                                data={history}
                                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <YAxis
                                    dataKey="value"
                                    domain={['dataMin - 50', 'dataMax + 50']}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={30}
                                />
                                <RechartsTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" hideLabel />}
                                />
                                <Line
                                    dataKey="value"
                                    type="monotone"
                                    stroke="hsl(var(--chart-4))"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No telemetry history</div>
                        )}
                    </div>
                </div>
            );
        case 'switch':
            return (
                 <div className="flex h-full items-center justify-center space-x-4">
                    <span className="text-lg font-medium">Device is {device.isOn ? "On" : "Off"}</span>
                </div>
            );
        default:
            return <p className="text-sm text-muted-foreground">No widget configured for this device.</p>;
    }
}


const DeviceCard = React.memo(function DeviceCard({ device, onTogglePower, className }: DeviceCardProps) {
  const [isAnalysisOpen, setAnalysisOpen] = React.useState(false);
  
  const lastSeen = device.telemetry?.timestamp ? new Date(device.telemetry.timestamp).toLocaleString() : 'Never';

  const handlePowerToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onTogglePower(device.id);
  }

  const handleDialogClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setAnalysisOpen(true)
  }

  return (
    <Link href={`/devices/${device.id}`} className="h-full" prefetch={false}>
      <Card className={cn("flex flex-col transition-all hover:shadow-lg h-full", className)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 overflow-hidden">
                <CardTitle className="text-lg truncate" title={device.name}>{device.name}</CardTitle>
                <CardDescription className="text-xs truncate" title={device.id}>{device.id}</CardDescription>
            </div>
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
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          {renderWidget(device)}
        </CardContent>
        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
          <Dialog open={isAnalysisOpen} onOpenChange={(isOpen) => {
              // Prevent link navigation when closing dialog
              if (!isOpen) {
                  setTimeout(() => setAnalysisOpen(false), 10);
              } else {
                  setAnalysisOpen(true);
              }
          }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-accent-foreground/80 hover:text-accent-foreground" onClick={handleDialogClick}>
                <BrainCircuit className="h-4 w-4" />
                Analyze
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <TelemetryAnalysis device={device} />
            </DialogContent>
          </Dialog>
          {device.widgetType === 'switch' ? (
              <div className="flex items-center gap-2">
                  <Power className="h-4 w-4 text-muted-foreground" />
                  <Switch
                      checked={device.isOn}
                      onClick={handlePowerToggle}
                      disabled={!device.isOnline}
                      aria-label="Toggle device power"
                  />
              </div>
          ) : (
              <p>Last seen: {lastSeen}</p>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
});

export default DeviceCard;
