import type { Device, Group } from './types';

const generateTelemetryHistory = (baseValue: number) => {
    return Array.from({ length: 30 }, (_, i) => ({
        time: new Date(Date.now() - (29 - i) * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}),
        value: parseFloat((baseValue + (Math.random() - 0.5) * 5).toFixed(2)),
    }));
};

export const INITIAL_DEVICES: Device[] = [];

export const INITIAL_GROUPS: Group[] = [
    { id: 'home', name: 'Home' },
    { id: 'garden', name: 'Garden' },
    { id: 'office', name: 'Office' },
];
