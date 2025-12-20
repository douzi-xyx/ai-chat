import { z } from 'zod';

export type ToolConfig<T = Record<string, unknown>> = {
  name: string;
  description: string;
  schema: z.ZodSchema;
  handler: (params?: T) => Promise<string> | string;
  options?: Record<string, unknown>;
  enabled?: boolean;
};
