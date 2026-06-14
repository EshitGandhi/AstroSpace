# Astrospace — Brand Restructure & Build Brief

## 0. How to Use This Brief (Execution Protocol for the Agent)

This file is the spec for restructuring Astrospace. Follow this sequence — do not jump straight to code.

1. **Read this entire brief first.**
2. **Audit the current repo**: list existing routes (`app/` or `pages/`), shared components, and current Tailwind/theme config. Summarize what exists today in 5–10 lines.
3. **Write a plan** (in chat, or as `PLAN.md`): every file to create/edit/delete, grouped by the phases in Section 7, with one line on *why* each change is needed. No code in this step.
4. **Wait for approval** before implementing — or proceed phase-by-phase if told to continue.
5. **Implement one file (or one tightly-coupled group) at a time.** Summarize each change before moving to the next. Don't batch unrelated files into one step.
6. **Don't touch business logic, data models, or routes outside this brief's scope** without flagging it first.
7. **Check the Acceptance line for each phase** (Section 7) before moving on.

---

## 1. Brand Identity

### 1.1 Logo
Place the real Astrospace logo at `/public/logo.svg` (plus `/public/logo-dark.svg` if a reversed version exists for the night surface — see 1.2). Until a real asset is provided, use a placeholder wordmark: "Astro" in `--ink` (on cream) or `--white` (on night) + "space" in `--bhagva`. Position: top-right on desktop (matches the reference), top-center on mobile.

### 1.2 Two Surfaces: Celestial & Earthly
The reference only ever puts white text on one saturated surface (its orange sidebar) — and even that sits around 2.98:1 contrast, clearing WCAG's large-text bar but not body text. Instead of fighting that, Astrospace gets **two surfaces**: a dark **Celestial** surface (night sky) where white and gold genuinely belong — used for the hero, footer, nav, and chart displays — and a light **Earthly** surface (cream) for service content and forms, where `--bhagva` is the accent and a warm dark ink carries body text. Bhagva threads through both — saffron against sky and against earth is the actual brand story, not just "orange page."

| Token | Hex | Surface | Use |
|---|---|---|---|
| `--night` | `#23121C` | Celestial | Hero, footer, mobile nav, chart background |
| `--night-2` | `#3A1F33` | Celestial | Gradient partner for `--night` |
| `--gold` | `#E0B33C` | Celestial | Constellation lines, chart glyphs, headings on night |
| `--bhagva` | `#E8590C` | Both | Primary CTA, links, accent words, active nav state |
| `--cream` | `#FFF8F0` | Earthly | Page background for content sections |
| `--cream-tint` | `#FCE9DA` | Earthly | Badge pills, hover states |
| `--ink` | `#2E1410` | Earthly | Headings & body text on cream |
| `--ink-muted` | `#6B5046` | Earthly | Secondary/description text |
| `--white` | `#FFFFFF` | Celestial | Text/icons on `--night` and on `--bhagva` buttons |

### 1.3 Typography
- **Display**: Poppins or Baloo 2 (Baloo 2 has clean Devanagari coverage if Hindi headline fragments — "Apni Kundli Dekhein", "Aaj Ka Rashifal" — get mixed in, matching the Hinglish tone of the reference).
- **Body**: Inter, with Noto Sans Devanagari as fallback for Hindi copy.
- **Chart labels**: a condensed weight of the display face, for planet/house glyphs.
- Headings: 700–800 weight, generous size — keep the reference's oversized hero scale.

### 1.4 Signature Element — The House Grid
Jyotish charts are built from **12 houses**, and houses 1, 4, 7, 10 (the *Kendra*/angular houses — self, home, relationships, career) are the most significant. That's a real, content-true sequence — use it as the site's structural device instead of a generic numbered list or icon grid:

- The hero's background on the Celestial surface is a faint gold constellation-line pattern echoing a 12-house diamond chart.
- The homepage's four flagship service teasers are framed as **House 1 / House 4 / House 7 / House 10**, each mapping to a real service (see 4.1) — the numbering carries meaning, it isn't decoration.
- The `KundliChart` component (Section 6.3) reuses this same diamond-grid geometry, so a visitor sees the motif on the homepage and later sees *their own chart* drawn in the same shape — that's the throughline.

Keep everything else quiet: no extra mandala borders, no Om glyphs scattered as decoration, no second "bold idea" competing with the house grid.

---

## 2. Layout Pattern (adapted from the reference)

**Keep**: a persistent left nav rail with icon+label items, wordmark anchored low in the rail, a large two-line hero headline with the second line in the accent color, a filled-pill primary button + outline secondary button, pill "eyebrow" badges above section headings, and a two-column intro (copy left, illustration right).

**Change**: the reference's rail is solid orange with white text everywhere — on Astrospace the rail uses `--night` (Celestial), so white text there is *correct*, not borderline. On screens <1024px, collapse the rail into a slide-out drawer; don't keep a fixed 280px sidebar on mobile for a site people will check casually on their phones.

---

## 3. Site Map & Navigation

| # | Label | Route | Surface |
|---|---|---|---|
| 1 | Home | `/` | mixed |
| 2 | About | `/about` | Earthly |
| 3 | Free Tools | `/tools` | Earthly |
| 4 | Kundli | `/kundli` | Celestial-leaning |
| 5 | Consultation | `/consultation` | Earthly |
| 6 | Talk to Astrologer | `/contact` (or chat widget) | Earthly |

Footer (Celestial): nav links, social, contact, privacy/terms (important — birth-time/place is sensitive data), copyright. Drop the reference's "Powered by" badge unless Astrospace has a tech partner to credit.

---

## 4. Page Specs

### 4.1 Home
- **Hero (Celestial)**: house-grid texture background, two-line headline — e.g. "Sitaaron Ki Bhasha, Aapki Zaroorat Ke Hisaab Se —" / **"Ab Aasaan, Ab Sahi."** (second line in `--bhagva` or `--gold`), short subhead, primary CTA "Apni Kundli Banayein" (`--bhagva` fill) + secondary "Free Rashi Check" (outline, white border on night).
- **Eyebrow + intro (Earthly)**: badge "Your Vedic Companion" (`--cream-tint` / `--bhagva`), two-column — copy left, chart-style illustration right (a stylised birth-chart/star-map graphic, not the reference's office illustration).
- **House 1 / 4 / 7 / 10 teaser row**: four cards — Rashi Check (1st, Self), Kundli (4th, Roots/Family), Matching (7th, Relationships), Consultation (10th, Path/Career). Each: house number, glyph, title, one line, link.
- **Secondary services strip**: Panchang, Daily Horoscope, Dasha Timeline — smaller cards, Earthly surface.
- **CTA banner (Celestial)** before footer.

### 4.2 About
Astrologer/brand story, credentials, photo or illustrated portrait — same two-column pattern as 4.1's intro, Earthly surface.

### 4.3 Free Tools — Rashi Checker
Form: Date of Birth (required), Time of Birth (optional — note that adding it improves accuracy). Result: instant **Sun-sign Rashi** (client-side, Section 6.1), with an upsell card → "Get your Moon-sign (Chandra) Rashi & full Kundli" linking to `/kundli`.

### 4.4 Kundli
Form: name, DOB, exact time, place of birth (city search → lat/long + timezone). Output: `KundliChart` (North or South Indian style, Section 6.3) rendered on the Celestial surface in gold-on-night — it's literally a map of the sky, so it should look like one — plus a details panel (Lagna, Rashi, Nakshatra, current Dasha) and a shareable summary.

### 4.5 Consultation
Astrologer profile cards (photo, specialization, languages, experience, rating), calendar/slot picker, booking form, payment (Razorpay is the standard for an India-facing audience), confirmation. "Talk to Astrologer" chat/WhatsApp deep-link as a lighter alternative to a full booking.

---

## 5. Component Inventory

| Component | Notes |
|---|---|
| `NavRail` | `--night` bg, white text/icons, desktop rail / mobile drawer |
| `Hero` | House-grid texture, two-line heading, CTA pair |
| `Badge` | Pill, `--cream-tint` bg, `--bhagva` text |
| `Button` | Primary: `--bhagva` fill, white text, rounded-full. Secondary: outline, surface-aware (white border on night, `--ink` border on cream) |
| `HouseCard` | Numbered house glyph + title + description + link (Sections 1.4 / 4.1) |
| `ServiceCard` | Smaller variant for Panchang/Horoscope/Dasha row |
| `KundliChart` | SVG, props: `houses`, `style` ("north" \| "south"), `surface` ("night" \| "cream") |
| `AstrologerCard` | Photo, name, specialties, rating, "Book" button |

---

## 6. Astrology Engine — Technical Plan

### 6.1 Rashi (Zodiac Sign)
- **Sun-sign Rashi**: 12 fixed DOB-range lookup, zero dependencies, instant client-side result. Ship first, independent of everything else.
- **Moon-sign (Chandra) Rashi** — what "Rashi" usually means in Vedic practice: the Moon moves ~13°/day, so this needs DOB **and** time, plus an ephemeris calculation. This is the same engine as Kundli below — don't build it twice.

### 6.2 Kundli (Birth Chart)
Inputs: DOB, exact time, place (lat/long + timezone). Three paths:

1. **Third-party Astrology API** (Prokerala, FreeAstrologyAPI, AstrologyAPI/VedAstro) — call from a Next.js API route so the key stays server-side; returns planet positions/houses/dasha ready-made. Fastest to ship; recurring cost; sends birth data to a third party — disclose this in the privacy policy.
2. **`astronomy-engine`** (pure JS/TS) — accurate positions, runs on edge/serverless, no native deps. You add the Lahiri ayanamsa offset (tropical → sidereal) and Vedic house assignment yourself (Whole Sign is simplest to get *correct*). More work, free, keeps data in-house.
3. **`swisseph`** (native bindings) — gold-standard accuracy, needs native compilation + ~50–100MB ephemeris data; Node server only, not edge.

**Recommended sequencing**: ship on path 1 for the MVP so Kundli is testable end-to-end; build path 2 behind a feature flag in parallel; validate it against a handful of known reference charts before switching over.

### 6.3 Chart Rendering
`KundliChart` takes a normalized `{ house: 1-12, planets: string[] }[]`. Support **North Indian** (diamond layout, houses fixed, signs rotate — the more widely recognized format for a Hindi-speaking audience) and **South Indian** (fixed grid, signs fixed, houses rotate from Lagna) via a `style` prop. On `/kundli`, render gold-on-`--night` (Section 4.4); the same component, reused at low opacity in the hero (1.4/4.1), becomes decoration.

### 6.4 Future Tools (same engine, later phases)
- **Daily/Weekly Horoscope** — templated content keyed by Sun-sign Rashi, no extra engine work.
- **Panchang** (today's Tithi/Nakshatra/Yoga/Karana) — same ephemeris, computed for "now" + location.
- **Kundli Matching (Guna Milan)** — Ashtakoot 36-point score from both partners' Moon Rashi/Nakshatra; reuses the Kundli engine.
- **Vimshottari Dasha timeline** — derived from the Moon's nakshatra at birth; same engine output.

---

## 7. Implementation Plan (Phased)

| Phase | Work | Acceptance |
|---|---|---|
| 0 | Audit repo, write the plan (Section 0) | Plan approved before any code |
| 1 | Add color/type tokens (1.2–1.3) to Tailwind config / CSS vars | Tokens usable as classes; no visual change yet |
| 2 | Rebuild `NavRail` + footer + mobile drawer (Sections 2–3) | Existing pages render inside new shell without breaking |
| 3 | Build shared components (Section 5) | All variants documented on a `/dev/components` page |
| 4 | Home page (Section 4.1) | Matches layout pattern, responsive at 375 / 768 / 1280px |
| 5 | Free Tools / Rashi Checker (4.3, 6.1) | Works fully client-side, no backend dependency |
| 6 | Kundli (4.4, 6.2, 6.3) | 3+ known reference charts produce correct house/planet placements |
| 7 | Consultation (4.5) | Booking + payment flow complete end-to-end |
| 8 | About, SEO, accessibility pass | Lighthouse mobile pass; contrast checked on both surfaces |

---

## 8. Notes for the Agent
- This brief is tool-agnostic — usable as a Claude Code / Cursor prompt, or saved as an Antigravity Workflow under `.agent/workflows/` and run phase-by-phase with `/astrospace-redesign`.
- If the current codebase uses Pages Router and this brief assumes App Router (or vice versa), flag that in Phase 0's plan — don't silently restructure routing.
- Birth date/time/place is sensitive personal data — whatever Kundli path is chosen, note it in the privacy policy and avoid retaining raw birth data beyond what the calculation/booking needs.
