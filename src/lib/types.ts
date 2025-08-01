export type WidgetType = 'temp-humidity' | 'light-sensor' | 'switch';

export interface Telemetry {
  temperature?: number;
  humidity?: number;
  pressure?: number;
  timestamp: number;
  light_level?: number;
  isOn?: boolean;
}

export interface Device {
  id: string;
  name: string;
  key: string;
  group: string;
  isOnline: boolean;
  isOn: boolean;
  widgetType: WidgetType;
  telemetry: Telemetry;
  telemetryHistory: { time: string; value: number }[];
}

export interface Group {
  id:string;
  name: string;
}

export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
}
