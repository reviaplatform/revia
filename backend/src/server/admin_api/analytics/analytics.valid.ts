import { z } from 'zod';

export const analyticsQuerySchema = z.object({
    period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
});
