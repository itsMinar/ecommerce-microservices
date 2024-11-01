import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z.string(),
  inventoryId: z.string(),
  quantity: z.number(),
});
