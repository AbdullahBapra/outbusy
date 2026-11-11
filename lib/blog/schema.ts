import { z } from "zod";

/**
 * Validation for blog writes — shared by the REST API (/api/posts) and the admin panel,
 * so both enforce exactly the same rules.
 */

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  text(max)
    .nullish()
    .transform((v) => v || null);

const fields = {
  title: text(200).min(1, "Title is required."),
  slug: text(80).toLowerCase().regex(SLUG, "Use lowercase letters, numbers and single hyphens (e.g. my-first-post)."),
  tag: text(60).min(1, "Category is required."),
  excerpt: text(400),
  content: z.string().trim().min(1, "Content is required.").max(100_000, "Content is too long (max 100,000 characters)."),
  readTime: optionalText(20),
  cover: z
    .strictObject({
      url: z.url({ protocol: /^https?$/, error: "Cover URL must be an http(s) URL." }).max(2048),
      alt: text(300).default(""),
    })
    .nullish(),
  author: z
    .strictObject({
      name: optionalText(100),
      role: optionalText(100),
    })
    .nullish(),
  takeaways: z.array(text(300).min(1)).max(5, "Up to 5 takeaways."),
  flow: z.array(text(40).min(1)).max(5, "Up to 5 labels."),
  published: z.boolean(),
  /** ISO date-time or YYYY-MM-DD. A future date schedules the post. */
  publishedAt: z.union([z.iso.datetime({ offset: true }), z.iso.date()]).nullish(),
};

/** POST /api/posts and new posts in the admin. */
export const postCreateSchema = z.strictObject({
  ...fields,
  slug: fields.slug.optional(),
  excerpt: fields.excerpt.optional(),
  takeaways: fields.takeaways.optional(),
  flow: fields.flow.optional(),
  published: fields.published.optional(),
});

/** PATCH /api/posts/:slug — every field optional, at least one required. */
export const postUpdateSchema = z
  .strictObject(fields)
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "Send at least one field to update." });

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;

/** GET /api/posts query string. */
export const listQuerySchema = z.object({
  status: z.enum(["published", "draft", "scheduled", "all"]).default("published"),
  tag: text(60).optional(),
  q: text(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});
export type ListQuery = z.infer<typeof listQuerySchema>;

export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
} as const;

/** POST /api/uploads */
export const uploadRequestSchema = z.strictObject({
  contentType: z.enum(Object.keys(IMAGE_TYPES) as [keyof typeof IMAGE_TYPES, ...(keyof typeof IMAGE_TYPES)[]], {
    error: "contentType must be image/jpeg, image/png, image/webp, image/avif or image/gif.",
  }),
  fileName: text(200).min(1, "fileName is required."),
});
