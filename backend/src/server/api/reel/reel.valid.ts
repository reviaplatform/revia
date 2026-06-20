import { z } from 'zod';

export const reelQuerySchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v, 10) : 1),
  limit: z.string().optional().transform(v => v ? parseInt(v, 10) : 10),
});
