# Portfolio Page — Design Spec

Source: Claude Design artifact "Mohsin Designs — Portfolio Page"
(`https://claude.ai/artifact/KPuMAjR7umTyiT5mYz4xaZ`), extracted from its source files
`project/Main.dc.html` and `project/CaseStudy.dc.html`. Every value below is copied from that source, not
estimated from screenshots. The only exceptions are the items marked **suggestion**.

| Board | File | Canvas size | Interactive |
|---|---|---|---|
| Portfolio — all work (listing) | `Main.dc.html` | 1440 × 4400 | Yes (service filter) |
| Case study template (detail) | `CaseStudy.dc.html` | 1440 × 4600 | No |

**Not in the design:**
- No dark mode, theme toggle (sun/moon) or `prefers-color-scheme` handling. The design is light-only, with dark sections used as accents.
- No before/after slider. "Before → after" is two static tiles side by side.
- No real images, icons or SVGs. Every visual is a pastel placeholder block with a label chip. Arrows are text glyphs (`→ ← ↗`).
- No media queries. Responsiveness comes only from `flex-wrap`, `auto-fill`/`auto-fit` grids and `clamp()` headings.
- No shadows, gradients or transitions anywhere. The look is flat.

---

## 1. Design tokens

### 1.1 Colors

| Token (suggested name) | Hex | Used for |
|---|---|---|
| `bg/page` | `#F5F4EF` | Page background (warm cream); approach step cards |
| `bg/surface` | `#FFFFFF` | Cards, stat tiles, testimonial cards, the "Our approach" band |
| `ink` | `#141414` | Primary text, dark buttons, dark panels, active filter pill, results band |
| `ink/link` | `#111111` | Base `<a>` color (global rule) |
| `brand` | `#E8541C` | Logo dot, active-nav underline, primary CTA button, CTA band, step numbers 1/2/3 |
| `brand/hover` | `#C2410C` | Global `a:hover` color |
| `brand/text` | `#B4410F` | Eyebrow labels and service tags on light backgrounds (darker for contrast) |
| `brand/on-dark` | `#FF8A5B` | Big stat numbers and eyebrows on dark backgrounds |
| `text/secondary` | `#4A4A45` | Lead paragraphs, card summaries, step descriptions |
| `text/body-strong` | `#3A3A36` | Challenge body copy, thumbnail chip text |
| `text/muted` | `#55554F` | Stat captions, "Showing N projects", footer, testimonial role |
| `text/tertiary` | `#6B6B64` | Card metric labels, industry, case-study meta labels, "Next project →" |
| `text/on-dark` | `#D6D6D0` | Captions on dark (hero dark tile, results cards) |
| `text/on-dark-2` | `#CFCFC8` | Body and stat labels in the featured case-study panel |
| `text/on-dark-3` | `#BDBDB6` | Placeholder text in the results "Proof" panel |
| `border` | `#DCDAD2` | Filter-bar rules, footer rule, meta-row rule, avatar placeholder |
| `border/pill` | `#CFCDC4` | Inactive filter pill border |
| `border/card-inner` | `#EEECE5` | Divider above card metrics |
| `surface/dark-2` | `#222222` | Stat tiles inside the featured panel; results "Proof" panel |
| `border/on-dark` | `#333333` | Results card borders |
| `placeholder/before` | `#E2E0D8` | "BEFORE" tile |
| chip bg | `rgba(255,255,255,0.85)` | Card thumbnail label chip (`0.88` on the case-study hero chip) |

**Placeholder pastel rotation.** Project thumbnails cycle through these six in order, by index `i % 6`.
The case-study gallery reuses them.

| # | Hex | Name |
|---|---|---|
| 0 | `#F2D4C4` | Peach (also case-study hero and "AFTER" tile) |
| 1 | `#D9E3DA` | Sage |
| 2 | `#DCD9EE` | Lavender |
| 3 | `#F1E6C2` | Butter |
| 4 | `#D3E1EC` | Powder blue |
| 5 | `#ECD5DF` | Blush |

### 1.2 Typography

Google Fonts: **Space Grotesk** (500, 600, 700) for the display font, logo, headings and all big numbers.
**Inter** (400, 500, 600) for body text and UI. Fallbacks: `system-ui, sans-serif`.

```
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap
```

| Role | Font | Size | Weight | Line-height | Letter-spacing | Other |
|---|---|---|---|---|---|---|
| H1 listing ("Work that moves the numbers.") | Space Grotesk | `clamp(44px, 6vw, 84px)` | 700 | 1.0 | -0.03em | |
| H1 case study | Space Grotesk | `clamp(40px, 5.5vw, 76px)` | 700 | 1.02 | -0.03em | max-width 1000px |
| H2 panel / CTA band | Space Grotesk | 44px | 700 (default) | 1.05 | -0.02em | |
| H2 "What clients say" | Space Grotesk | 36px | 700 | normal | -0.02em | |
| H2 results ("Numbers the client can feel.") | Space Grotesk | 40px | 700 | 1.1 | -0.02em | |
| H2 case-study sections | Space Grotesk | 34px | 700 | 1.1 | -0.02em | |
| Case-study pull quote | Space Grotesk | 32px | 400 | 1.35 | -0.01em | centered |
| Next-project / CTA card title | Space Grotesk | 28px | 600 | 1.15 (CTA) | | |
| Project card title (H3) | Space Grotesk | 24px | 600 | 1.2 | | |
| Logo "Mohsin**.**Designs" | Space Grotesk | 22px | 700 | | | dot in `#E8541C` |
| Results stat | Space Grotesk | 72px | 700 | 1 | | `#FF8A5B` |
| Step number (1/2/3) | Space Grotesk | 44px | 700 | | | `#E8541C` |
| Hero / featured stat | Space Grotesk | 40px | 700 | | | |
| Card metric value | Space Grotesk | 22px | 700 | | | |
| Lead paragraph (case study) | Inter | 20px | 400 | 1.55 | | max-width 760px |
| Lead paragraph (listing) | Inter | 19px | 400 | 1.55 | | max-width 560px |
| Step title (H3) | Inter | 20px | 700 (default) | | | |
| Challenge body | Inter | 18px | 400 | 1.7 | | |
| Testimonial quote | Inter | 18px | 400 | 1.55 | | |
| Featured panel body | Inter | 17px | 400 | 1.6 | | |
| Case-study meta value | Inter | 17px | 600 | | | |
| Step body | Inter | 16px | 400 | 1.6 | | |
| Nav links | Inter | 15px | 400 (active 600) | | | |
| Card summary | Inter | 15px | 400 | 1.5 | | |
| "Read case study →" | Inter | 15px | 600 | | | |
| Filter pill | Inter | 14px | 500 | | | |
| Small text (captions, count, footer) | Inter | 14px | 400 | | | |
| Eyebrow label | Inter | 13px | 600 | | 0.12em | UPPERCASE |
| Case-study tag pill | Inter | 13px | 600 | | | |
| Card service tag | Inter | 12px | 600 | | 0.06em | UPPERCASE |
| Case-study meta label | Inter | 12px | 600 | | 0.10em | UPPERCASE |
| Card metric label / industry | Inter | 12px | 400 | | | |

### 1.3 Layout, spacing and radii

- **Container:** `max-width: 1280px; margin: 0 auto; padding-left/right: 32px`. Content is 1216px wide at desktop.
- **Section rhythm:** 72–80px vertical padding between major sections. 56px inside big panels.
- **Gaps:** 8 / 10 / 12 / 14 / 16 / 20 / 24 / 28 / 48px.

| Radius | Used on |
|---|---|
| `999px` | All pills: nav CTA, buttons, filter chips, tag pills |
| `28px` | Large panels: featured case study, CTA band, case-study hero image |
| `24px` | Next-project card, case-study CTA card |
| `20px` | Project cards, testimonial cards, step cards, gallery tiles, results cards |
| `16px` | Stat tiles |
| `8px` | Label chips on placeholders |
| `50%` | Avatar |

| Button | Padding | Style |
|---|---|---|
| Nav "Book a call" | `12px 20px` | `#141414` bg, white text |
| "See the full story" | `15px 26px` | `#E8541C` bg, white, 600 |
| "Get a free quote" (CTA band) | `16px 26px` | `#141414` bg, white, 600 |
| "Schedule a consultation" | `16px 26px` | white bg, `#141414` text, 600 |
| "Get a free quote" (case study) | `15px 24px` | `#141414` bg, white, 600 |
| Filter pill | `10px 18px`, `min-height: 44px` | see §2.3 |

---

## 2. Page 1 — Portfolio listing (`Main.dc.html`)

Sections are listed in the order they should appear. See §5.1: in the source, the project grid is
misplaced after the footer.

### 2.1 Header
- `padding: 24px 32px`. Flex, `space-between`, `align-items: center`, wraps, gap 16px.
- Left: logo **Mohsin<span>.</span>Designs**, with the dot in `#E8541C`.
- Right nav (gap 28px, 15px): Services · **Portfolio** · About · Blogs · `[Book a call]` pill.
- Active item "Portfolio": weight 600, `border-bottom: 2px solid #E8541C`, `padding-bottom: 2px`.

### 2.2 Hero
- `padding: 72px 32px 56px`. Flex wrap, gap 48px, `align-items: flex-end` (bottoms of both columns align).
- **Left** (`flex: 1 1 560px`):
  - Eyebrow `OUR WORK · 12 SERVICES · REAL RESULTS` (`#B4410F`, margin-bottom 16px).
  - H1 "Work that moves / the numbers." (forced line break).
  - Lead (19px, `#4A4A45`, margin-top 24px): "Every project below shows the problem, what we did, and the result it delivered. Filter by the service you need."
- **Right** (`flex: 0 1 420px`): 2-column grid, gap 12px, three stat tiles (`padding: 22px`, radius 16):
  1. White: **3,000+** / "US businesses served"
  2. White: **[000]+** / "Projects delivered" (placeholder)
  3. `#141414`, spans 2 columns: **300%** in `#FF8A5B` / "more customer interaction for Burish Builders in 6 months" (`#D6D6D0`)
  - Captions: 14px, `#55554F`, margin-top 4px.

### 2.3 Filter bar
- Wrapper: `border-top` and `border-bottom: 1px solid #DCDAD2`; `padding: 20px 0`; flex wrap, gap 10px.
- 13 pills: **All** plus the 12 services from §2.5, in that order.
- Pill style: `font: 500 14px Inter; min-height: 44px; padding: 10px 18px; border-radius: 999px; cursor: pointer`.
  - Inactive: `border: 1px solid #CFCDC4; background: transparent; color: #141414`.
  - Active: `border: 1px solid #141414; background: #141414; color: #fff`.
- Below the bar: "Showing **N** projects" (14px, `#55554F`, margin-top 20px).
- Behavior: clicking a pill sets the filter. "All" shows 12 cards. Each service shows only its own card,
  and each service has exactly one project.

### 2.4 Project grid (belongs directly under the filter bar)
- Section `padding: 24px 32px 80px`. Grid `repeat(auto-fill, minmax(340px, 1fr))`, gap 24px. This gives 3 columns at desktop.
- **Card:** white, radius 20, `overflow: hidden`, flex column. Cards stretch to equal height in each row.
  - **Thumbnail:** 220px tall, pastel background (§1.1 rotation), `padding: 16px`. Bottom-left chip
    (13px/500, `#3A3A36` on `rgba(255,255,255,.85)`, `padding: 6px 10px`, radius 8) with the visual's label,
    e.g. "Homepage mockup" or "SEO Services visual".
  - **Body:** `padding: 24px`, flex column, gap 14px, `flex-grow: 1`.
    1. Meta row: **SERVICE** (12px/600 uppercase, `#B4410F`) followed by `· Industry` (12px, `#6B6B64`).
    2. H3 client name.
    3. Summary (15px/1.5, `#4A4A45`).
    4. Metrics: 3-column grid, gap 8px, `margin-top: auto` (pins the row to the card bottom),
       `padding-top: 14px`, `border-top: 1px solid #EEECE5`. Value 22px/700 Space Grotesk. Label 12px `#6B6B64`.
    5. Link "Read case study →" (15px/600, `padding-top: 12px`).

### 2.5 Project data (12 cards)

| # | Service (filter label) | Client | Industry | Summary | Metric 1 | Metric 2 | Metric 3 | Thumb |
|---|---|---|---|---|---|---|---|---|
| 1 | Website Design | **Burish Builders** | Construction | New brand and conversion-focused website that turned visitors into quote requests. | 48% overall boost | 300% interaction | 6 mo timeline | Peach, "Homepage mockup" |
| 2 | SEO Services | [Client name] | [Industry] | [Problem] → [what we did]. Ranked for [keyword group] in [city]. | [+0%] organic traffic | [00] page-1 keywords | [+0%] leads | Sage |
| 3 | GMB Optimization | [Client name] | [Local business] | Fixed categories, service areas and reviews to win the local map pack. | [#0] map ranking | [+0%] calls | [0★] avg. rating | Lavender |
| 4 | Google Ads Management | [Client name] | [Industry] | Cut wasted spend and rebuilt campaigns around conversion data. | [-0%] cost per lead | [0x] ROAS | [$0] saved / mo | Butter |
| 5 | Meta Ads Management | [Client name] | [Industry] | Facebook + Instagram campaigns with clean tracking and weekly creative tests. | [0x] ROAS | [$0] cost per result | [0k] reach | Powder blue |
| 6 | Social Media Management | [Client name] | [Industry] | Content calendar and community management that built trust and sales. | [+0k] followers | [0%] engagement | [0] DM leads / mo | Blush |
| 7 | Content Marketing | [Client name] | [Industry] | Intent-led articles that rank on Google and get cited in AI search. | [00] articles | [+0%] organic visits | [0] AI citations | Peach |
| 8 | App Development | [Client name] | [Industry] | Designed and built an app focused on retention and daily use. | [0k] downloads | [0%] 30-day retention | [0★] store rating | Sage |
| 9 | Website Development | [Client name] | [Industry] | Custom fast build around customer behavior and lead capture. | [0.0s] load time | [+0%] conversions | [00] CWV score | Lavender |
| 10 | UI/UX Design | [Client name] | [SaaS / product] | Redesigned key flows so users find what they need in fewer steps. | [-0%] drop-off | [+0%] sign-ups | [0] screens | Butter |
| 11 | Logo Design | [Client name] | [Industry] | A logo built from the brand story, market and target customer. | [0] concepts | [0] revisions | [0 wk] delivery | Powder blue |
| 12 | Graphic Design | [Client name] | [Industry] | Posts, flyers and brand visuals that grab attention in seconds. | [00] assets | [0] campaigns | [+0%] engagement | Blush |

Thumb chip text defaults to `"<Service> visual"` unless set. Only card 1 sets it ("Homepage mockup").

**Suggested CMS data model for one project:** `service`, `client`, `industry`, `summary`,
`metrics[3] {value, label}`, `thumbImage` (or a fallback pastel), `thumbLabel`, `caseStudySlug`.

### 2.6 Featured case study panel
- Section `padding: 0 32px 80px`. Panel: `#141414` background, white text, radius 28, `padding: 56px`. Flex wrap, gap 48px, vertically centered.
- **Left** (`flex: 1 1 480px`):
  - Eyebrow `FEATURED CASE STUDY` in `#FF8A5B` (margin-bottom 12px).
  - H2 "Burish Builders: from word-of-mouth to a steady flow of quote requests."
  - Body (17px/1.6, `#CFCFC8`, margin-top 20px): "Brand, website and lead flow rebuilt for a construction company. [One line on the starting problem.]"
  - Button **See the full story**: `#E8541C` pill, margin-top 28px. Links to the case study.
- **Right** (`flex: 1 1 360px`): 3-column grid, gap 12px. Tiles are `#222`, radius 16, `padding: 24px 18px`.
  Value 40px/700 in `#FF8A5B`, label 13px in `#CFCFC8`:
  **48%** overall boost · **300%** customer interaction · **6 mo** to results.

### 2.7 Testimonials — "What clients say"
- Section `padding: 0 32px 80px`. H2 36px, margin-bottom 28px.
- Grid `repeat(auto-fill, minmax(320px, 1fr))`, gap 20px. Three `<figure>` cards: white, radius 20, `padding: 28px`.
  - Quote: 18px/1.55, "“[Real client quote — 1–2 sentences about the result.]”"
  - Caption (margin-top 18px, 14px, `#55554F`): **[Client name]** (bold, `#141414`) · [Role, Company].
- All three are placeholders.

### 2.8 CTA band
- Section `padding: 0 32px 64px`. Band: `#E8541C` background, white text, radius 28, `padding: 56px`. Flex wrap, `space-between`, gap 24px, centered.
- H2 (44px, `flex: 1 1 480px`): "Want results like these? / Let's build something you're proud of."
- Buttons (gap 12px): **Get a free quote** (`#141414`/white), **Schedule a consultation** (white/`#141414`).

### 2.9 Footer
- `padding: 28px 32px 48px`, `border-top: 1px solid #DCDAD2`, 14px, `#55554F`. Flex `space-between`, wraps.
- Left: "© Mohsin Designs · 312 W 2nd St, Casper, WY". Right: "+1 307 449 2070 · Replies in under 2 hours".

---

## 3. Page 2 — Case study template (`CaseStudy.dc.html`)

Built for **Burish Builders**. Background is `#F5F4EF` throughout, except the full-width white
"approach" band and the full-width black "results" band.

### 3.1 Header (simplified)
- Same logo as the listing (links back to the listing). On the right is only "← All work" (15px). There is no full nav.

### 3.2 Intro
- `padding: 56px 32px 40px`.
- Tag pills (gap 8px, margin-bottom 20px; 13px/600, `padding: 8px 14px`, `#141414` background, white text):
  **Logo & Brand** · **Website Design** · **Lead Generation**.
- H1: "Burish Builders: 300% more customer interaction in 6 months."
- Lead (20px/1.55, `#4A4A45`, max 760px, margin-top 24px): "How a new brand and a conversion-focused website turned a
  local construction company's site into a quote-request machine."

### 3.3 Hero image
- 520px tall, radius 28, `#F2D4C4` placeholder, `padding: 28px`.
- Chip (14px/500, `rgba(255,255,255,.88)`, `padding: 8px 12px`, radius 8): "Hero image: final website on laptop + phone mockup".

### 3.4 Project meta row
- `padding: 40px 32px`. Grid `repeat(auto-fit, minmax(200px, 1fr))` (5 columns at desktop), gap 24px.
  `border-bottom: 1px solid #DCDAD2`.
- Each item: label (12px/600, uppercase, 0.1em, `#6B6B64`) with value below (17px/600, margin-top 6px).
- **Client** Burish Builders · **Industry** Construction · **Location** [City, State] · **Timeline** 6 months ·
  **Live site** [website.com] ↗ (link).

### 3.5 "01 — The challenge"
- `padding: 72px 32px`. Flex wrap, gap 48px.
- **Left** (`flex: 1 1 280px`): eyebrow plus H2 "Great work on site, invisible online." (margin-top 12px).
- **Right** (`flex: 2 1 520px`; 18px/1.7, `#3A3A36`): one placeholder paragraph, then a bulleted list
  (margin-top 20px, padding-left 20px) of three pain-point placeholders:
  no clear brand identity, website not generating leads, hard to request a quote on mobile.

### 3.6 "02 — Our approach" (full-width white band)
- Inner `padding: 72px 32px`. H2 "Three steps, one goal: more quote requests." (margin-bottom 36px).
- Grid `repeat(auto-fit, minmax(260px, 1fr))`, gap 20px. Three cards: `#F5F4EF` background, radius 20, `padding: 28px`.
  - Number (44px/700, `#E8541C`). H3 (20px, margin `8px 0 10px`). Body (16px/1.6, `#4A4A45`).
  - **1 Brand**: new logo, colors, typography. **2 Website**: fast, mobile-first, gallery and service pages.
    **3 Quote flow**: short form, click-to-call, lead tracking. All body copy is placeholder.

### 3.7 "03 — The work": before/after and gallery
- `padding: 72px 32px`. H2 "Before → after" (margin-bottom 32px).
- **Before/after row:** grid `repeat(auto-fit, minmax(320px, 1fr))` (2 columns), gap 20px. Each tile is 340px tall, radius 20, `padding: 20px`.
  - Left **BEFORE**: `#E2E0D8`, chip "BEFORE — old website / logo screenshot".
  - Right **AFTER**: `#F2D4C4`, chip "AFTER — new website / logo".
  - Chips: white, 14px/600, `padding: 6px 12px`, radius 8.
  - This is a **static side-by-side pair**, not a drag slider or toggle.
- **Gallery row** (margin-top 20px): grid `repeat(auto-fit, minmax(240px, 1fr))` (3 columns), gap 20px. Each tile is 240px tall, radius 20, `padding: 16px`.
  Chips are 13px, `padding: 6px 10px`.
  - "Logo + brand board" `#D9E3DA` · "Mobile screens" `#DCD9EE` · "Quote form / dashboard" `#F1E6C2`.

### 3.8 "04 — The results" (full-width `#141414` band)
- Inner `padding: 80px 32px`. Eyebrow in `#FF8A5B`. H2 40px "Numbers the client can feel." (margin-bottom 40px).
- Grid `repeat(auto-fit, minmax(240px, 1fr))` (4 columns), gap 16px. Cards have no fill:
  `border: 1px solid #333`, radius 20, `padding: 32px`. Value 72px/700, line-height 1, `#FF8A5B`.
  Caption 16px `#D6D6D0`, margin-top 12px.
  - **300%** increase in customer interaction · **48%** overall boost [name the metric] · **6** months to results ·
    **[00]** [quote requests per month].
- **Proof panel** (margin-top 20px): 260px tall, `#222`, radius 20, centered text (14px `#BDBDB6`):
  "Proof: Google Analytics / Search Console / Ads screenshot".

### 3.9 Client quote
- `max-width: 960px`, `padding: 80px 32px`, centered.
- Blockquote: Space Grotesk 32px/1.35, "“[Client quote about working with Mohsin Designs and the results — keep it real and specific.]”"
- Attribution (margin-top 28px, gap 14px, centered row): 56px avatar circle (`#DCDAD2`), then **[Owner name]** (600)
  over "Owner, Burish Builders" (14px `#55554F`).

### 3.10 Next project and CTA pair
- `padding: 0 32px 72px`. Flex wrap, gap 20px. Two equal cards (`flex: 1 1 400px`), each radius 24 with `padding: 36px`.
  - **Next project** (the whole card is a link): white. "Next project →" (13px `#6B6B64`), then
    "[Next client] · [Service]" (Space Grotesk 28px/600, margin-top 8px).
  - **CTA**: `#E8541C` background, white text, flex column, gap 16px. "Want the same for your business?"
    (Space Grotesk 28px/600, line-height 1.15), then a **Get a free quote** pill (`#141414`).
- The case-study page has **no footer** in the design.

---

## 4. Interaction and hover states (as designed)

- **Global link rule:** `a { color: #111 } a:hover { color: #C2410C }`. There is no transition.
  - Hover **does** change: nav links (Services, Portfolio, About, Blogs), "Read case study →", "← All work",
    "[website.com] ↗", and the Next-project card title.
  - Hover **does not** change any link with an inline color: the logo, all pill buttons ("Book a call", "See the full story",
    "Get a free quote", "Schedule a consultation") and "Next project →". These have **no hover state**.
- **Filter pills:** clicking one swaps it to the active style (§2.3). There is no hover or focus style, only
  `cursor: pointer`. The project count updates.
- **Cards:** no hover effect (no lift, shadow or scale). Only the "Read case study →" text link is clickable;
  the card itself is not.
- **Focus states:** none defined (browser default outline).
- **Links:** every project card, and the featured panel, links to the same case-study template.
- **Theme:** light only. No toggle.

---

## 5. Issues found in the design source

1. **The project grid renders below the footer.** In `Main.dc.html` the card-grid `<section>` comes *after*
   `</footer>`, while the slot between the filter bar and the featured panel is empty. The result is the order
   "Showing 12 projects" → featured panel → testimonials → CTA → footer → **12 cards**. "Showing 12 projects" also sits
   flush against the featured panel with no gap. The intended order is filter bar → grid → featured panel.
2. **"Showing 1 projects".** The count isn't pluralized, and any single-service filter produces this text.
3. **Divider lines overhang the content.** The footer `border-top` and the case-study meta-row `border-bottom` sit on
   elements whose 1280px width includes the 32px padding. Each line extends 32px past the content edge on both sides.
4. **Contrast:** white text on `#E8541C` is about **3.7:1**. That passes AA for large text (the 44px CTA heading and
   28px CTA title) but **fails AA for normal text**. The 16px "See the full story" button is affected.
5. **No hover or focus states** on buttons and filter pills. See §4.
6. **Filter pills have no `aria-pressed`,** so the active state is only visual.
7. **The case-study page has no main nav and no footer.**

---

## 6. Placeholders still to fill

- Listing: "[000]+ Projects delivered"; featured panel "[One line on the starting problem.]"; all three testimonials;
  client, industry and metrics for cards 2–12; all thumbnail images.
- Case study: Location; Live site URL; challenge paragraph and three pain points; the three approach descriptions;
  hero, before, after and gallery images; "[name the metric]" for 48%; the "[00] quote requests per month" stat;
  proof screenshot; client quote and owner name; next-project client and service.

---

## 7. Dark-mode mapping (**suggestion**, not in the design)

If this page has to follow the site's theme toggle, here is a starting mapping that keeps the design's character:

| Light (design) | Dark (suggested) | Notes |
|---|---|---|
| `#F5F4EF` page | `#121211` | Warm near-black instead of pure black |
| `#FFFFFF` surfaces | `#1C1C1A` | Cards, testimonial cards, approach band |
| `#141414` ink | `#F2F1EC` | Primary text |
| `#4A4A45` / `#55554F` / `#6B6B64` | `#B8B7B0` / `#A3A29B` / `#8C8B84` | Secondary / muted / tertiary text |
| `#DCDAD2` / `#EEECE5` borders | `#2E2E2B` / `#262624` | |
| `#B4410F` eyebrows | `#FF8A5B` | The design already uses this on dark |
| `#141414` dark panels (featured, results) | `#1C1C1A` plus a 1px `#2E2E2B` border | Keeps them distinct from the page |
| Active pill `#141414` bg / white text | `#F2F1EC` bg / `#141414` text | Inverts the same way |
| Pastel placeholders | Same hues at about 18% opacity over the page | Only until real images replace them |
