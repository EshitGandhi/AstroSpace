# AstroGuru Kundli — Chat Work Log

> **Purpose:** Single reference for everything discussed and built across the Kundli feature chats (including this session).  
> **Last updated:** June 26, 2026  
> **Branch context:** `Divy/kundli` (commit `775f0a7` — *Add Kundli generation module*)

---

## Goals (evolved over the chats)

1. Add **KUNDLI** to sidebar navigation (minimal, non-breaking)
2. Polish Kundli UX (profile pre-fill, print/PDF, share)
3. Add **full Vimshottari Dasha timeline** (engine + UI, no database)
4. Add **saved Kundli history** (Prisma + privacy + UI) — planned in chat
5. Complete **privacy/consent + tests** for saved Kundli — planned in chat
6. Fix **profile-setup runtime error** (cookie setting in Server Component)

**Constraints throughout:** extend existing code, don’t rebuild; avoid breaking auth/profile/booking flows; proficient (not pro-grade) Kundli; minimal DB impact where possible.

---

## What is in the repo today

### ✅ Committed — Kundli generation module (`775f0a7`)

| Area | What was done | Key files |
|------|---------------|-----------|
| **Navigation** | `KUNDLI` nav item → `/kundli`, `Moon` icon | `src/components/layout/NavRail.tsx` |
| **Kundli page** | Form → calculate → chart + details + dasha tabs | `src/app/kundli/page.tsx`, `KundliPageClient.tsx` |
| **Profile pre-fill** | Logged-in users: `GET /api/profile` fills birth fields | `KundliPageClient.tsx`, `KundliForm.tsx` |
| **Print / PDF** | `@media print` styles; `no-print` on chrome; Print button | `src/app/globals.css`, `NavRail.tsx`, `Footer.tsx` |
| **Share** | Copy text summary to clipboard | `src/lib/kundli/share-summary.ts` |
| **Vedic engine** | Lahiri chart via `@ishubhamx/panchangam-js` | `src/lib/vedic/calculate.server.ts` |
| **Dasha engine** | Full 9 Mahadasha cycle + Antardashas; fixes library “current dasha” bug | `src/lib/vedic/dasha/timeline.ts`, `types.ts` |
| **Dasha UI** | Timeline panel + Chart/Dasha tabs in results | `src/components/kundli/DashaTimeline.tsx`, `KundliDetailsPanel.tsx` |
| **API** | Stateless `POST /api/kundli` (unchanged pattern) | `src/app/api/kundli/route.ts` |
| **Tests** | Dasha timeline, reference charts, share summary, integration | `src/lib/vedic/__tests__/`, `src/lib/kundli/__tests__/` |
| **Vitest** | `server-only` mock for server imports in tests | `vitest.config.ts` |

### ✅ Uncommitted — Profile cookie sync fix (this chat)

**Problem:** Visiting `/profile-setup` crashed with:

> *Cookies can only be modified in a Server Action or Route Handler.*

**Cause:** `profile-setup/page.tsx` called `cookies().set("profile_complete", ...)` during Server Component render — not allowed in Next.js 14 App Router.

**Fix (Option A — Route Handler):**

| File | Role |
|------|------|
| `src/lib/profile/cookies.ts` | Shared `setProfileCompleteCookie()` helper |
| `src/app/api/profile/sync-cookie/route.ts` | Checks session + DB → sets cookie → redirects to `/dashboard` |
| `src/app/profile-setup/page.tsx` | If profile complete → `redirect("/api/profile/sync-cookie")` |
| `src/app/api/profile/route.ts` | Refactored to use shared cookie helper |

**Flow:**

```
/profile-setup (profile complete in DB, cookie missing)
  → redirect /api/profile/sync-cookie
  → sets profile_complete=1
  → redirect /dashboard
  → middleware allows access
```

### ⏳ Discussed in chat but NOT in current repo

The following were designed and partially implemented in an earlier chat session (Phases 1–5 **saved Kundli history**). **These files are not present in the workspace** as of this log — re-implement or restore from transcript if still needed:

- `Kundli` Prisma model + migration
- `GET/POST /api/kundli/saved`, `GET/DELETE /api/kundli/saved/[id]`
- `KundliSavePanel.tsx`, `SavedKundliList.tsx`, `KundliResultView.tsx`
- `/kundli/[id]` saved chart viewer
- `validate-save-payload.ts`, `input-hash.ts`, `storage-consent.ts`
- Privacy policy sections for saved Kundli data
- Tests: `validate-save-payload.test.ts`, `saved-api.test.ts`, `saved-flow.test.ts`

If you need saved history, treat the above as the spec and rebuild on top of the committed Kundli module.

---

## Phase-by-phase summary

### Phase 0 — Audit
- `/kundli` already listed in middleware protected paths — no change needed.

### Phase 1 — Sidebar
- Added **KUNDLI** to `NavRail` with `Moon` icon, href `/kundli`.

### Phase 2 — Profile pre-fill
- On mount, authenticated users fetch `/api/profile`.
- Maps profile → `KundliForm` `initialValues` (name, DOB, time, place, lat/lng, timezone).
- Skeleton loader while profile loads.

### Phase 3 — Print / PDF / Share
- Print button calls `window.print()`.
- Print CSS hides nav/footer (`.no-print`), shows chart + dasha + footer line.
- Share copies `buildKundliShareSummary(result)` to clipboard.

### Phase A–D — Vimshottari Dasha timeline
- **Engine:** Maps library `dasha.fullCycle` → 9 Mahadashas; computes Antardashas; `getCurrentDashaFromTimeline()` derives *today’s* dasha (library `currentMahadasha` is birth-period only).
- **Types:** `DashaTimeline`, `DashaPeriod`, `MahadashaPeriod` in `src/lib/vedic/types.ts`.
- **UI:** `DashaTimelinePanel` + Birth Chart / Dasha Timeline tabs.
- **Tests:** `timeline.test.ts`, `dasha-assertions.ts`, `dasha-integration.test.ts`, extended `reference-charts.test.ts`.

### Saved Kundli (chat plan — not in repo)
- Explicit **Save to My Account** (not auto-save).
- Duplicate detection via `@@unique([userId, inputHash])` → HTTP 409.
- Consent checkbox on first save + localStorage consent key.
- Privacy policy updates for stored birth data and deletion rights.

### Profile cookie fix (this chat)
- See **Uncommitted** section above.

---

## Architecture decisions

| Topic | Choice |
|-------|--------|
| Route | `/kundli` (not `/dashboard/kundli`) |
| Engine | Keep `@ishubhamx/panchangam-js` via `calculate.server.ts` |
| Calculate API | Stateless `POST /api/kundli` — no DB write on generate |
| Current dasha | Derived from timeline at runtime, not library `currentMahadasha` |
| Profile gate | Middleware checks `profile_complete` cookie |
| Cookie sync | Route Handler only — never `cookies().set()` in `page.tsx` |

---

## Important file map (current repo)

```
src/
├── app/
│   ├── api/
│   │   ├── kundli/route.ts              # POST calculate (stateless)
│   │   └── profile/
│   │       ├── route.ts                 # GET/POST/PATCH profile + cookie on complete
│   │       └── sync-cookie/route.ts     # Cookie sync + redirect (NEW, uncommitted)
│   ├── kundli/
│   │   ├── page.tsx
│   │   └── KundliPageClient.tsx
│   ├── profile-setup/page.tsx           # Redirects to sync-cookie if complete
│   ├── privacy/page.tsx
│   └── globals.css                      # @media print rules
├── components/
│   ├── layout/NavRail.tsx               # KUNDLI nav item
│   └── kundli/
│       ├── KundliForm.tsx
│       ├── KundliChart.tsx
│       ├── KundliDetailsPanel.tsx
│       └── DashaTimeline.tsx
├── lib/
│   ├── kundli/share-summary.ts
│   ├── profile/cookies.ts               # NEW, uncommitted
│   └── vedic/
│       ├── calculate.server.ts
│       ├── dasha/timeline.ts
│       └── types.ts
└── middleware.ts                        # profile_complete gate + /kundli protected
```

---

## Errors encountered & resolutions

| Issue | Resolution |
|-------|------------|
| PowerShell `&&` | Use `;` instead |
| Vitest `server-only` import | Mock in `vitest.config.ts` |
| Library `currentMahadasha` wrong for past births | `getCurrentDashaFromTimeline()` |
| Prisma migrate drift (saved Kundli chat) | Migration file + user runs `npx prisma db push` locally |
| `cookies().set()` in `page.tsx` | Route Handler `/api/profile/sync-cookie` |
| `isValidKundliResult()` missing `birthDetails` (saved Kundli chat) | Fixed in chat; file not in repo |

---

## Manual QA checklist

### Kundli (committed features)
- [ ] Sidebar **KUNDLI** → `/kundli`
- [ ] Logged-in user: form pre-fills from profile
- [ ] Generate chart → North/South toggle works
- [ ] Birth Chart / Dasha Timeline tabs
- [ ] Print / PDF hides chrome, shows chart
- [ ] Share copies summary to clipboard

### Profile cookie (uncommitted fix)
- [ ] User with complete profile but no cookie → lands on dashboard (no crash)
- [ ] Incomplete profile → stays on profile-setup
- [ ] No redirect loop between `/dashboard` and `/profile-setup`

### Saved Kundli (when re-implemented)
- [ ] Generate → consent → Save → list → `/kundli/[id]` → delete
- [ ] Duplicate save → 409
- [ ] User A cannot access User B’s chart
- [ ] Privacy page matches stored data

---

## Commands

```bash
# Dev server
npm run dev

# Tests
npm test

# DB (only if/when Kundli model is added)
npx prisma db push
npx prisma generate
```

---

## Git status snapshot (end of this chat)

**Committed:** `775f0a7` — Add Kundli generation module  

**Uncommitted (profile cookie fix):**
- `src/app/api/profile/route.ts`
- `src/app/profile-setup/page.tsx`
- `src/app/api/profile/sync-cookie/` (new)
- `src/lib/profile/` (new)

---

## Next steps (suggested)

1. **Commit** the profile cookie sync fix.
2. **Re-implement saved Kundli** if still required (use “Discussed in chat” section as spec).
3. Run **`npm test`** after any new work.
4. Apply Prisma schema when saved Kundli model is added.

---

*This log was written from chat transcripts and the current workspace state. Update it when new Kundli work lands.*
