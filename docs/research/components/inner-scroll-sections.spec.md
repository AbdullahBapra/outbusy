# Inner-page scroll sections — spec

Reference: https://www.phaedrasolutions.com/services/ai/agent (layout + motion only; all copy is ours).
Values come from the site's CSS rules and computed styles (read on 2026-09-30).

## Global
- Inner pages override the root font size: `html { font-size: 11.5px }` at `max-width: 1666px`
  (the home page stays at 12.5px). Implemented with `html:has(.inner-page)`.
- Type classes: `.heading-title` 13.375rem / lh 80% / 700 uppercase; `.sub-heading` 2.625rem / lh 120%;
  `.heading-2` 5rem / lh 90%; `.body-text` 1.125rem / lh 1.75rem / weight 100.

## 1. IntroStack (`.we-turn`) — INTERACTION: CSS sticky + IntersectionObserver
- Container padding 0 3rem (container-v1). Section itself has no padding.
- Heading row `.flex-block-390`: `display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-end`.
  ≥992px: `position:sticky; top:0; z-index:100` (white background).
  Contents: h2 (display word with an accent word + `.sub-heading` 600 line), body-text (max 47.8rem), pill button bottom-right.
- JS 1: `--header-height = heading.offsetHeight` (on load + resize).
- JS 2: heading gets `transition: margin-bottom .7s ease`. IntersectionObserver (threshold 0) on the **2nd card**:
  when it intersects or has scrolled past (`top < 0`) → `margin-bottom: 50rem`, else `0`. (<992px: margin 0.)
- Grid `.grid-207`: 2 equal columns, gap 7.5rem, margin-top 2.8rem.
- Left `.turn-cards`: flex column, gap 1.5rem. Each card:
  bg #fff, border 1px rgba(0,0,0,.5), radius 1.875rem, max-width 40.625rem, margin 0 auto, padding 1.5rem,
  `position:sticky; top: calc(var(--header-height) + 20px)`, rotate(-2deg).
  Card 2: bg #00efd4, rotate(1deg). Card 3: bg #97fff4, rotate(-1deg).
  Inside: h3 2.625rem/700 uppercase, margin-top .625rem; body-text; media block margin 2rem 0 1rem.
- Right: media, radius 3rem, width 100%, max-height 25rem, `position:sticky; top:27rem`.
- <992px: everything static, no rotation, grid → single column.

## 2. StackedList (`.reliable`) — INTERACTION: CSS sticky stacking
- Section padding 7.5rem 0.
- Heading `.flex-block-390.heading-sticky`: `position:sticky; top:5rem`, flex row space-between, align-end.
- Cards wrapper `.gutter-space`: flex wrap, gap 1.875rem, margin-top 1.875rem, background #fff.
- Card: width 100%, min-height 10rem, padding 1.75rem 10rem 1.75rem 4rem, radius 1.875rem,
  border 1px rgba(0,0,0,.5), `position:sticky; top:33rem`. Cycle: white → #97fff4 (border same) → #038475 (white text).
  h3 `.heading-2` 5rem/lh 90%/700 uppercase, margin-top .625rem; p body-text, margin-bottom .625rem.
  Hover: round #00efd4 link (10.4rem, right 2.3rem) fades in (`opacity 1` on card hover).
- <992px: top 11.5rem, padding-left 1rem.

## 3. TypesTimeline (`.ai-types-section`) — INTERACTION: scroll-driven (JS scroll listener)
- Wrapper `.spce-dive`: `position:relative; min-height:400rem`.
- Section: `position:sticky; top:0; min-height:100vh; display:flex; align-items:center; overflow:hidden`, padding 3.5rem 0.
- Heading: display word (black) + accent word; sub line 2.4rem/300 uppercase with a bold part; body-text.
- `.stick-content`: flex row, margin-top 1rem, height 48rem.
  Left col (47.4rem): vertical 1px #00efd4 line at right edge (top 10px). Groups are absolutely stacked.
  `.content-group`: opacity 0, visibility hidden, translateY(15px), transition opacity/transform/visibility .5s ease.
  `.is-active`: opacity 1, visible, translateY(0).
  Item: padding-bottom 2rem; title 1.375rem/700/lh 2.875rem; body-text.
  Dot per item on the line: 2.5rem circle, bg #00efd4, 8px white border, right -1.2rem, top .25rem.
  Active dot (item index == group index): bg #fff, border #00efd4.
  Right col: `position:sticky; top:12rem`, max-width 45%, margin-left auto, padding-left 8rem → illustration.
- JS: `progress = clamp(-rect.top / (wrapper.offsetHeight - innerHeight), 0, 1)`;
  group = progress < .33 ? 0 : progress < .66 ? 1 : 2. Only ≥992px; below that all groups are static/visible.
