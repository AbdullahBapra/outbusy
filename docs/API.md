# Blog REST API

Base URL: `https://<your-domain>/api` (locally `http://localhost:3000/api`).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/health` | — | Service and database status |
| `POST` | `/auth/login` | — | Sign in as admin (sets the session cookie) |
| `POST` | `/auth/logout` | — | Sign out |
| `GET` | `/auth/session` | — | `{ authenticated: boolean }` |
| `GET` | `/posts` | optional | List posts |
| `POST` | `/posts` | **admin** | Create a post |
| `POST` | `/posts/import` | **admin** | Copy the built-in example posts into the database |
| `GET` | `/posts/:ref` | optional | Get one post |
| `PATCH` | `/posts/:ref` | **admin** | Update some fields of a post |
| `DELETE` | `/posts/:ref` | **admin** | Delete a post |
| `POST` | `/uploads` | **admin** | Get a signed URL to upload an image |

`:ref` is a post's **slug** or its **id** (UUID). The id never changes, so prefer it in integrations that may rename slugs.

## Authentication

The API uses the **admin login**, the same password as `/admin` (`ADMIN_PASSWORD`). `POST /api/auth/login` sets a secure, httpOnly session cookie that lasts 7 days, and the browser sends it with every request. The admin panel calls this API, so there's one login for everything.

- Reads work without signing in, but only return **published** posts. Signed-in admins can also read drafts and scheduled posts.
- Write requests must come from this website (`Origin` check). Together with the `SameSite=Lax` cookie and the JSON-only bodies, this blocks cross-site request forgery.

From a terminal, keep the cookie in a file and send a matching `Origin` header:

```bash
curl -c jar.txt -H "Origin: http://localhost:3000" -H "Content-Type: application/json"   -d '{"password":"…"}' http://localhost:3000/api/auth/login
curl -b jar.txt -H "Origin: http://localhost:3000" … # later requests
```

## Responses

All responses are JSON.

```jsonc
// Success
{ "data": { … }, "meta": { "total": 12, "limit": 20, "offset": 0 } }   // meta on lists only

// Error
{ "error": { "code": "validation_failed", "message": "…", "details": [{ "path": "title", "message": "Title is required." }], "requestId": "…" } }
```

| Status | `code` | When |
|---|---|---|
| 400 | `invalid_json` | Body isn't valid JSON |
| 401 | `unauthorized` / `invalid_credentials` | Not signed in, or wrong password |
| 403 | `forbidden_origin` | Write request from another website |
| 404 | `not_found` | No post with that slug or id |
| 409 | `conflict` | The slug is already used by another post |
| 413 | `payload_too_large` | Body over 1 MB |
| 415 | `unsupported_media_type` | Body isn't sent as `application/json` |
| 422 | `validation_failed` / `invalid` | Field errors (see `details`) |
| 500 | `internal_error` / `database` | Unexpected server error (quote the `requestId`) |
| 503 | `not_configured` / `admin_disabled` | Supabase or `ADMIN_PASSWORD` isn't set |

Every response has an `X-Request-Id` header. You can send your own `X-Request-Id` to trace a request end to end.

## Post object

```jsonc
{
  "id": "6f1c…",                 // null for built-in example posts
  "slug": "speed-to-lead",
  "url": "/blog/speed-to-lead",
  "title": "Why Speed-To-Lead Wins Deals",
  "tag": "Sales",
  "excerpt": "…",
  "content": "Markdown source…",
  "blocks": [{ "type": "h2", "text": "…" }, …],   // parsed content, ready to render
  "readTime": "4 min",
  "status": "published",         // published | scheduled | draft
  "publishedAt": "2026-07-08T12:00:00.000Z",
  "cover": { "url": "https://…", "alt": "…" },   // or null
  "author": { "name": "…", "role": "…" },
  "takeaways": ["…"],
  "flow": ["New Lead", "Instant Reply", "Call"],
  "createdAt": "…",
  "updatedAt": "…"
}
```

### Content format (Markdown)

```markdown
Opening paragraph. Paragraphs are separated by a blank line.

## Section heading

Text with **bold**, *italic* and [links](https://example.com).

- List item
- Another item

> A pull quote

> [!TIP] Tip title
> Tip text

![Alt text](https://image-url "Optional caption")
```

## Endpoints

### `GET /posts`

Query parameters:

| Param | Default | Notes |
|---|---|---|
| `status` | `published` | `published`, `scheduled`, `draft`, `all`. Anything other than `published` needs an admin login. |
| `tag` | — | Exact category, case-insensitive |
| `q` | — | Search in titles (and excerpts on public reads) |
| `limit` | `20` | 1–50 |
| `offset` | `0` | For paging |

Public responses can be cached by a CDN (`s-maxage=60`) and can be called from any website (CORS). Signed-in responses are never cached.

```bash
curl "https://example.com/api/posts?tag=sales&limit=10"
```

### `POST /posts`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string ≤ 200 | ✓ | |
| `tag` | string ≤ 60 | ✓ | Category |
| `content` | string ≤ 100k | ✓ | Markdown |
| `slug` | string ≤ 80 | | Lowercase and hyphens. Built from the title if left out |
| `excerpt` | string ≤ 400 | | |
| `readTime` | string | | Worked out from the content if left out |
| `cover` | `{ url, alt }` or `null` | | |
| `author` | `{ name, role }` | | |
| `takeaways` | string[] ≤ 5 | | |
| `flow` | string[] ≤ 5 | | Labels for the animated cover shown when there's no image |
| `published` | boolean | | Default `false` (draft) |
| `publishedAt` | ISO date-time or `YYYY-MM-DD` | | A future date schedules the post. Publishing without a date uses now |

Unknown fields are rejected, so typos don't get silently ignored. Returns **201** with the post and a `Location` header.

```bash
curl -X POST https://example.com/api/posts \
  -b jar.txt -H "Origin: https://example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How we cut no-shows by 35%",
    "tag": "Voice AI",
    "excerpt": "What happened when a clinic let an AI receptionist answer after hours.",
    "content": "Missed calls cost clinics money.\n\n## What we built\n\nA **voice agent** that books 24/7.",
    "takeaways": ["Start with after-hours calls", "Review transcripts weekly"],
    "published": true
  }'
```

### `GET /posts/:ref`

Without signing in, returns the post only if it's published. Signed-in admins get it whatever its status.

### `PATCH /posts/:ref`

Send only the fields you want to change, with the same rules as `POST`. Send at least one field. For example, to publish a draft:

```bash
curl -X PATCH https://example.com/api/posts/how-we-cut-no-shows-by-35 \
  -b jar.txt -H "Origin: https://example.com" -H "Content-Type: application/json" \
  -d '{ "published": true }'
```

`"cover": null` removes the cover image, and `"publishedAt": null` clears the publish date.

### `DELETE /posts/:ref`

Deletes the post permanently and returns **204** with no body.

### `POST /uploads`

Images go straight to Supabase Storage and never pass through this server, so there's no size limit from the API (the storage bucket allows up to 10 MB per image).

```bash
# 1. Ask for a signed upload URL
curl -X POST https://example.com/api/uploads \
  -b jar.txt -H "Origin: https://example.com" -H "Content-Type: application/json" \
  -d '{ "contentType": "image/jpeg", "fileName": "clinic-front-desk.jpg" }'
# → 201 { "data": { "uploadUrl": "…", "publicUrl": "…", "method": "PUT", "headers": { "Content-Type": "image/jpeg" }, … } }

# 2. Upload the file
curl -X PUT "<uploadUrl>" -H "Content-Type: image/jpeg" --data-binary @clinic-front-desk.jpg

# 3. Use publicUrl as cover.url, or in content as ![alt](publicUrl)
```

Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/gif`. A signed URL works for one upload and expires after 2 hours.

### `GET /health`

```json
{ "status": "ok", "database": "ok", "writeApi": "enabled", "time": "…" }
```

Returns 503 when Supabase is configured but can't be reached, so you can point an uptime monitor at it.

## Notes

- Changes made through the API show on the website straight away: every write clears the blog cache.
- The admin panel (`/admin`) and the API use the same validation and database code (`lib/blog/`), so they always follow the same rules.
- There's no built-in rate limit. Wrong passwords are slowed down, but for extra protection add a Vercel Firewall rate-limit rule on `/api/auth/login`.
