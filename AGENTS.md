<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Website Reverse-Engineer Template

## What This Is
A reusable template for reverse-engineering any website and rebuilding it as a faithful clone using Claude Code. The Next.js + shadcn/ui + Tailwind v4 base is pre-scaffolded — just fill in TARGET.md and run `/clone-website`.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React (default — will be replaced/supplemented by extracted SVGs)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Vercel

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **No personal aesthetic changes during emulation phase** — match 1:1 first, customize later
- **Real content** — use actual text and assets from the target site, not placeholders
- **Beauty-first** — every pixel matters

## Project Structure
```
app/                # Next.js routes (App Router)
  (site)/           # Public website pages (shared header/footer layout)
  admin/            # Blog admin panel (/admin)
  api/              # REST API route handlers (see docs/API.md)
  layout.tsx        # Root layout (fonts, metadata)
  globals.css
components/         # React components
  ui/               # shadcn/ui primitives
  blog/             # Blog article + card components
  admin/            # Admin panel components
  icons.tsx         # Extracted SVG icons as React components
content/            # Site copy and data (placeholders)
lib/
  utils.ts          # cn() utility (shadcn)
  supabase.ts       # Supabase clients
  api/              # API helpers: responses, errors, API-key auth
  blog/             # Blog domain: schema (zod), service (writes), queries (cached reads), mappers
public/
  images/           # Logos and static images
supabase/
  schema.sql        # Database tables, policies, storage bucket
docs/
  research/         # Inspection output (design tokens, components, layout)
  design-references/ # Screenshots and visual references
scripts/            # Asset download scripts
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.

@docs/research/INSPECTION_GUIDE.md
@TARGET.md
