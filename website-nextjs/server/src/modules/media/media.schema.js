import { z } from 'zod';

export const mediaDeleteSchema = z.object({
  url: z.string().url('URL must be a valid URL'),
});
