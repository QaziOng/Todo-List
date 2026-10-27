import { z } from "zod";

const completedField = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().default(false));

const imageUrlField = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .trim()
    .url("Enter a valid image URL.")
    .refine((value) => /^https?:\/\//i.test(value), "Only HTTP(S) URLs are allowed.")
    .optional()
    .nullable(),
);

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(72),
  description: z.string().trim().optional().nullable(),
  completed: completedField,
  imageUrl: imageUrlField,
});
