
"use client";

import * as React from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import type { Device } from "@/lib/types";
import { analyzeTelemetryAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TelemetryAnalysisProps {
  device: Device;
}

export default function TelemetryAnalysis({ device }: TelemetryAnalysisProps) {
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const telemetryDataString = JSON.stringify(
      {
        current_telemetry: device.telemetry,
        recent_history: device.telemetryHistory?.slice(-10) || [],
      },
      null,
      2
    );

    try {
      const result = await analyzeTelemetryAction({
        telemetryData: telemetryDataString,
      });
      if (result.analysisResult) {
        setAnalysis(result.analysisResult);
      } else {
        setError("Received an empty analysis. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Telemetry Analysis for {device.name}</DialogTitle>
        <DialogDescription>
          Review raw telemetry data and use GenAI to detect anomalies or provide insights.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <h3 className="font-semibold mb-2">Raw Telemetry Data</h3>
          <ScrollArea className="h-72 w-full rounded-md border p-4">
            <pre className="text-sm">
              {JSON.stringify({
                current: device.telemetry,
                history: device.telemetryHistory?.slice(-10) || []
              }, null, 2)}
            </pre>
          </ScrollArea>
        </div>
        <div>
            <h3 className="font-semibold mb-2">AI Analysis Result</h3>
            <div className="h-72 w-full rounded-md border flex flex-col">
                {isLoading ? (
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ) : error ? (
                    <div className="p-4">
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                ) : analysis ? (
                    <ScrollArea className="flex-1 p-4">
                        <p className="text-sm whitespace-pre-wrap">{analysis}</p>
                    </ScrollArea>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Click the button below to generate AI-powered insights for this device.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleAnalyze} disabled={isLoading}>
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Telemetry
            </>
          )}
        </Button>
      </div>
    </>
  );
}
