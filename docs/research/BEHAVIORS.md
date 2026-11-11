# Behaviors (reference: phaedrasolutions.com, inspected 2026-09-29 @1440px)

Design/layout/motion reference only. All copy, names, logos, photos and media in the
clone are ORIGINAL placeholders (see `content/site.ts`), not taken from the reference.

## Global
- Webflow site, jQuery + IX2 (hover interactions only), no Lenis / smooth-scroll library.
- Root font-size steps: default 16px, <=1920px 15px, <=1666px 12.5px, <=1024px 10px, <=600px 16px.
  Every measurement below is in rem so the whole layout scales with those steps.
- Font: Archivo (100–900). Big display words are 13.375rem / 700 / lh 10.7rem / ls -0.062rem / uppercase.
- Accent #00EFD4, dark teal #00897A, mint tints #F2FEFD #D9FFFB #C0FFF8 #97FFF4, ink #040404, text #1A1B1F.

## Header
- `position:absolute` top, bg rgba(0,0,0,.93), padding 1.563rem 0, transition .3s.
- Links white 16px; mega-menu dropdowns open on hover (white panel, links turn dark-teal on hover).
- CTA: white bg, black text, radius .625rem, padding .5rem 2rem, 16.25px/500.

## Buttons (buttonv2 / buttonv2-2)
- Pill radius 1.875rem, padding .813rem .938rem, gap .938rem, 1.375rem uppercase.
- Right-side 3rem circular arrow icon. HOVER: icon translate(.2rem) rotate(-40deg) (IX2, ~0.3s ease).
- ::after background layer scaleX(1.02) on hover, transition .5s.

## Scroll-driven
- Services section: heading block `position:sticky; top:5rem`; each phase block
  `position:sticky; top:25rem; background:#fff` so later phases slide over earlier ones (stacking cards).
- Phase 01 card row is a CSS marquee: `@keyframes marquee {to{transform:translateX(-50%)}} 18s linear infinite`.

## Time-driven
- Hero rating strip: auto-scrolling logo/rating slider (Splide).
- Projects: 3 slides, dot pagination (active dot filled #00EFD4, border #00897A), autoplay.
- Blog: horizontal carousel with round prev/next arrows.
- Awards: logos `transition: transform 1s ease-in-out` (scale on hover).

## Click-driven
- FAQ accordion: rows 8rem tall, bottom border, arrow icon on right rotates when open, answer 1.5rem/300.

## Responsive
- <=991px: grids collapse to 2 cols, <=767px: single column, big words shrink to ~5rem, nav collapses to burger.
