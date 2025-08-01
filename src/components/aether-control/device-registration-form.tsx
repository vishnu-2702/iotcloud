
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as React from "react";
import { LoaderCircle } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import type { Device } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  group: z.string().min(2, "Group must be at least 2 characters."),
  widgetType: z.enum(['temp-humidity', 'light-sensor', 'switch']),
});

type FormData = z.infer<typeof formSchema>;
type RegistrationFormProps = {
  onRegister: (data: Omit<Device, 'isOnline' | 'telemetry' | 'telemetryHistory' | 'isOn'>) => Promise<void>;
  onFinished: () => void;
};


export default function DeviceRegistrationForm({ onRegister, onFinished }: RegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      group: "default",
      widgetType: "temp-humidity",
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    const generatedKey = `ak-${crypto.randomUUID()}`;
    const generatedId = `dev-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
        await onRegister({ ...values, key: generatedKey, id: generatedId });
        onFinished();
    } catch (error) {
        console.error("Failed to register device", error);
        toast({
            title: "Registration Failed",
            description: "Could not register the device. Please try again.",
            variant: "destructive"
        })
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Living Room Sensor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Group</FormLabel>
              <FormControl>
                <Input placeholder="e.g., home" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="widgetType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Widget Type</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a widget type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="temp-humidity">Temperature & Humidity</SelectItem>
                  <SelectItem value="light-sensor">Light Sensor</SelectItem>
                  <SelectItem value="switch">On/Off Switch</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This determines how data is displayed on the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
           {isSubmitting ? (
             <>
               <LoaderCircle className="animate-spin" />
               Registering...
             </>
           ) : "Register and Get API Key"}
        </Button>
      </form>
    </Form>
  );
}
