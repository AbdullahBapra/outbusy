import { z } from "zod";

/** A knowledge entry written by the team in the admin panel. */
export const manualEntrySchema = z.strictObject({
  title: z.string().trim().min(3, "Give the entry a title.").max(160),
  body: z.string().trim().min(20, "Write at least a sentence or two.").max(50_000),
  url: z
    .union([z.literal(""), z.string().trim().max(300).regex(/^(\/|https:\/\/)/, "Use a site path like /pricing or a full https:// link.")])
    .optional()
    .transform((v) => v || undefined),
});

export type ManualEntryInput = z.input<typeof manualEntrySchema>;
