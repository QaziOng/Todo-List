import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(72),
  description: z.string().trim().optional().nullable(),
  completed: z.boolean().default(false),
  image_url: z.string().trim().url("Must enter a URL").optional().nullable(),
});
