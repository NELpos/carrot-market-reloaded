import { z } from "zod";

export const productSchema = z.object({
  photo: z.string({
    required_error: "Photo is required",
  }),
  title: z.string({ required_error: "Title is required" }),
  price: z.coerce.number({ required_error: "Price is required" }),
  description: z.string({ required_error: "Description is required" }),
});

export const productUpdateSchema = z.object({
  title: z.string({ required_error: "Title is required" }),
  price: z.coerce.number({ required_error: "Price is required" }),
  description: z.string({ required_error: "Description is required" }),
  photo: z.string().optional(),
});

export type ProductType = z.infer<typeof productSchema>;
