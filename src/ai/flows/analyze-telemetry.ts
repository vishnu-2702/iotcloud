'use server';

/**
 * @fileOverview Telemetry Analysis AI agent.
 *
 * - analyzeTelemetry - A function that handles the telemetry analysis process.
 * - AnalyzeTelemetryInput - The input type for the analyzeTelemetry function.
 * - AnalyzeTelemetryOutput - The return type for the analyzeTelemetry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTelemetryInputSchema = z.object({
  telemetryData: z
    .string()
    .describe(
      'The telemetry data to analyze, in JSON format.'
    ),
});
export type AnalyzeTelemetryInput = z.infer<typeof AnalyzeTelemetryInputSchema>;

const AnalyzeTelemetryOutputSchema = z.object({
  analysisResult: z
    .string()
    .describe('The analysis result, including identified anomalies and potential device issues.'),
});
export type AnalyzeTelemetryOutput = z.infer<typeof AnalyzeTelemetryOutputSchema>;

export async function analyzeTelemetry(input: AnalyzeTelemetryInput): Promise<AnalyzeTelemetryOutput> {
  return analyzeTelemetryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTelemetryPrompt',
  input: {schema: AnalyzeTelemetryInputSchema},
  output: {schema: AnalyzeTelemetryOutputSchema},
  prompt: `You are an expert in analyzing telemetry data from IoT devices.

  You will receive telemetry data in JSON format. Your task is to analyze this data and identify any anomalies or potential issues with the devices.

  Provide a detailed analysis of the telemetry data, highlighting any anomalies, potential device issues, and their possible causes.

  Telemetry Data: {{{telemetryData}}}`,
});

const analyzeTelemetryFlow = ai.defineFlow(
  {
    name: 'analyzeTelemetryFlow',
    inputSchema: AnalyzeTelemetryInputSchema,
    outputSchema: AnalyzeTelemetryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
