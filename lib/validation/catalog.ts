import { z } from "zod";

export const catalogItemSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(100),
});

export type CatalogItemValues = z.infer<typeof catalogItemSchema>;
