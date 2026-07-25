# Discovery — UI/UX redesign

> **Purpose.** This document is the clarification phase requested before any implementation.
> Nothing gets built until the blocking sections (A, C, D, H) are answered.
>
> **How to answer.** Write your answer inline after each `→`. Where you agree with my
> proposal, write `ok` — that is enough. Where you don't, overwrite it.
> Proposals are *suggestions to react to*, never assumptions I will act on silently.
>
> **Status:** 8 decisioni bloccanti prese · il resto attende risposta
> **Created:** 2026-07-25

---

## ✅ Decisioni prese (2026-07-25)

Queste **non si rimettono in discussione**. Sono già applicate nel codice e
riflesse in `DESIGN.md`, `ARCHITECTURE.md` e `REFERENCES.md`.

| # | Domanda | Decisione |
|---|---|---|
| D1 | Direzione visiva | **Ibrida** — forma dai `refs/`, significato da Pistoia |
| H1 | Strato di primitive | **Astryx** (`@astryxdesign/core`) |
| C1 | Ambito di questo giro | **Design system + token**, nessun lavoro sulle pagine |
| J1 | Intensità del motion | **Livello 4** — con i componenti-firma |
| D2 | Accento | Teal Pistoia `#0E9F92` come `--color-accent`; lime `#D9F312` come `--highlight` decorativo, **mai testo** |
| F1 | Tipografia | **Schibsted Grotesk** + **JetBrains Mono** |
| H-primitive | Le 16 primitive | **Ricostruirle come componenti Pistoia su Astryx** — rimandato all'ondata 6, fondamenta provate |
| J-firma | Componenti-firma | **Tutti e quattro**: matrice di punti, mesh, timeline a punti, sezione narrata |

**Assunzioni dichiarate** (correggile se sbagliate):
- **L5** — documentazione in **italiano**, per coerenza con il corpus esistente.
- **J9** — `prefers-reduced-motion` resta un interruttore totale, come da
  `DESIGN.md` §7 precedente. La mia proposta era "ridotto ma presente": non
  l'ho applicata perché contraddiceva una decisione esplicita già presa.
- **M2** — il tema usa `light-dark()` e `color-mix()`, che richiedono
  **Chrome 123+ / Safari 17.5+ / Firefox 120+**. Se serve una soglia più
  bassa, dimmelo: cambia l'impianto del tema.

---

---

## 0. What I found before asking (context for your answers)

Three facts shape almost every question below.

**0.1 — This is not a greenfield project.** The app already exists and is substantial:
282 TS/TSX files, 30+ routes under `src/app/(app)/`, 19 component folders, 16 UI primitives
in `src/components/ui/`, 4 hand-built charts (`line-chart`, `ring-gauge`, `sparkline`,
`treemap`). Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4,
Prisma 7 + SQLite, **Motion 12 already installed**, next-themes, Zod. Five completed
"ondate" (waves) of feature work are in git history.

**0.2 — There is already a design system, and it disagrees with your reference images.**
`DESIGN.md` defines a deliberate, well-argued civic identity: Pistoia's checkerboard crest,
Romanesque marble banding, "green city" nursery symbolism; teal/viola/amber/red/green
semantics; Montserrat as single voice; sober institutional motion. The 10 images in `refs/`
are a *different* aesthetic entirely — the "Superpower" health dashboard by Ron Design Lab:

| | Current `DESIGN.md` | `refs/*.jpg` |
|---|---|---|
| Canvas | near-white `#fbfbfd` + teal/viola corner glows | warm mid-grey `~#E9E9E9` |
| Surfaces | white cards, 1px borders, soft shadow | pure-white squircles, borderless, diffuse shadow |
| Radius | 0.85 / 1.5 / 2rem | very large squircle (~28–44px), pill list rows |
| Accent | teal `#10b3a3` + viola `#8a7bf0` | single acid lime `~#D9F312`, used on 3–4 elements total |
| Numerals | Montserrat semibold | **dot-matrix / LED stencil** display figures |
| Hero surfaces | teal→viola gradient, one per page | **mesh gradients with film grain** (green/amber, blue/orange, magenta) |
| Type | Montserrat (geometric) | tight neo-grotesque, light weights, high size contrast |
| Charts | rings, treemap, sparkline | dot-scatter timelines, tick-mark micro-charts |

This is a genuine fork in the road, not a detail. Section D resolves it.

**0.3 — Astryx is a heavier commitment than the other references.** It is Meta's design
system (Beta), React + StyleX, 160+ components. Good news: themes ship as **plain CSS custom
properties**, StyleX is optional, and there is an official `example-nextjs-tailwind` bridge.
Cost: it brings its own token layer (color/spacing/radius/typography) that would compete with
the existing token system in `globals.css`, it uses cascade layers (`@layer reset`,
`@layer astryx-base`) that require explicit ordering against Tailwind, and adopting it
seriously means rewriting the 16 existing UI primitives. Section H resolves it.

---

## A. Product & strategy *(blocking)*

**A1.** Is this still a demo/portfolio piece with mock data, or is it heading toward a real
pitch to the Comune di Pistoia (or another municipality)?
*Proposal:* portfolio-grade demo built so it could survive a real pitch.
→

**A2.** If it is a pitch: who is in the room? Elected officials, IT department, citizens'
association, a hackathon jury? This changes how much the UI should "perform."
→

**A3.** What is the single sentence you want someone to say after 60 seconds with it?
*Proposal:* "I finally understand where my city's money goes."
→

**A4.** What is the #1 reason you're redesigning now — the current UI looks dated, looks
generic, doesn't photograph well for a portfolio, or doesn't hold attention?
→

**A5.** Is there a competitor or peer product you want to visibly beat?
→

**A6.** Is the visual ambition allowed to exceed what a real municipality would ship
(i.e. is "too beautiful for a public body" an acceptable risk)?
*Proposal:* yes — aim high, keep it defensible.
→

**A7.** Does the project need to survive being handed to another developer, or is it yours
alone indefinitely?
*Proposal:* must survive handover — that is what the documentation set is for.
→

---

## B. Users & context of use

**B1.** Rank the audiences by importance: ordinary citizens · civically-engaged citizens ·
municipal staff/admins · journalists · associations · other.
→

**B2.** Realistic age skew of the citizen audience? The existing "modalità semplice"
(simple mode, 115% scale) suggests you're already designing for older users.
→

**B3.** Mobile vs desktop split you're designing for?
*Proposal:* 65% mobile / 35% desktop, but desktop is the "wow" surface for demos.
→

**B4.** Is this used in short bursts (check a report status) or long sessions (explore the
budget)? Different density answers.
→

**B5.** Digital literacy floor — must a first-time, low-confidence user succeed unaided?
*Proposal:* yes, for the 4 core tasks (report a problem, check budget, vote a poll,
read an answer).
→

**B6.** Should "modalità semplice" survive the redesign as-is, be strengthened, or be
replaced by a design that needs no simple mode?
→

**B7.** Any accessibility obligation you're actually bound by (AgID / EU Directive
2016/2102 / WCAG 2.1 AA as Italian public-sector law), or is AA a self-imposed standard?
→

---

## C. Scope & sequencing *(blocking)*

**C1.** Which of these is the deliverable?
- (a) Design system + tokens only, no page work
- (b) Design system + 3–5 flagship pages as a vertical slice
- (c) Full re-skin of all 30+ routes
- (d) Design system + flagship pages now, remaining routes in later waves

*Proposal:* (d).
→

**C2.** If a vertical slice: which pages are the flagships? My read of "most impressive +
most used" is **Bilancio, Segnalazioni (list + detail), La mia città, Opere**.
→

**C3.** Are any routes candidates for deletion or merging? 30+ routes is a lot for a civic
app — `promesse`, `patti`, `priorita`, `decisioni`, `question-time`, `iniziative`,
`progetti`, `proposte` may overlap in the user's mind.
*Proposal:* worth an information-architecture pass; flag it, don't act unilaterally.
→

**C4.** Is the login/registration flow in scope? It's the first screen anyone sees in a demo.
*Proposal:* yes, high priority — first impression.
→

**C5.** Is the admin area in scope, or citizen-facing only?
*Proposal:* citizen-facing first; admin inherits tokens but no bespoke design work.
→

**C6.** Is a marketing/landing page in scope, or does the app open straight at login?
→

**C7.** Any hard deadline or event this is aimed at?
→

---

## D. Visual direction *(blocking — see §0.2)*

**D1.** Which is it?
- (a) **Keep** the current Pistoia civic identity, refine execution only
- (b) **Adopt** the `refs/` aesthetic wholesale, retire the checkerboard/banding/teal system
- (c) **Hybrid** — take the *structure* from `refs/` (grey canvas, white squircles, radical
  restraint, one accent, oversized numerals) and keep Pistoia's *meaning* (crest red, civic
  color semantics, Romanesque banding as a subtle motif)

*Proposal:* (c). The `refs/` layout language is stronger and more contemporary; the Pistoia
symbolism is what stops it from being a generic template. Dropping the symbolism entirely
would make it beautiful but anonymous.
→

**D2.** The acid lime accent (`~#D9F312`) — adopt as-is, translate to a Pistoia-derived
accent, or drop? Note: lime on white fails contrast for text and works only as a
background chip with dark text.
*Proposal:* adopt but restrict to non-text roles (chips, slider handles, "live" dots),
never as a text or icon color on light backgrounds.
→

**D3.** The **dot-matrix / LED numerals** are the single most distinctive element in `refs/`.
Adopt for hero metrics? They are gorgeous but reduce legibility, and a civic budget figure
is exactly where legibility matters most.
*Proposal:* adopt as an *optional* display treatment for one hero number per page, with a
real-text accessible equivalent, and automatically disabled in "modalità semplice" and under
`prefers-reduced-motion`. Never for tables, amounts in euros, or anything a user must
transcribe.
→

**D4.** **Mesh gradients with film grain** on hero cards — adopt? They are the second-most
distinctive element and carry the whole "premium" feel.
*Proposal:* yes, but the gradient must *encode data* (e.g. budget health green→amber→red),
not decorate. This is how it stays defensible for a public body.
→

**D5.** Warm mid-grey canvas (`#E9E9E9`-ish) with white cards — this inverts the current
near-white canvas. Accept?
*Proposal:* yes; it is what makes white cards read as objects, and it's the foundation of
the whole `refs/` look.
→

**D6.** How far can the dark theme diverge? `refs/10.jpg` shows a dark translucent glass card
over photography — a different register from the current `#0e1117` blue-night.
*Proposal:* dark = warm near-black canvas, elevated grey-900 squircles, same accent,
glass reserved for overlays only.
→

**D7.** Photography/imagery — currently there is essentially none. Introduce real imagery of
Pistoia (piazze, cantieri, quartieri), keep it fully abstract, or generated gradients only?
*Proposal:* real photography for Quartieri and Opere only, where it carries information;
gradients everywhere else.
→

**D8.** Do the three identity motifs (checkerboard, Romanesque banding, nursery green)
survive? Which ones?
→

**D9.** Anything in `refs/` you specifically *don't* want? (Worth saying — I read those
images as an endorsement of the whole language.)
→

**D10.** Should I look at any Refero Styles entries as an additional benchmark, or are
`refs/` sufficient as the visual target?
→

---

## E. Color & theming

**E1.** Keep the current five-color semantic system (teal=action, viola=participation,
amber=waiting, red=brand/urgent, green=resolved)?
*Proposal:* keep the semantics, retune the hues to sit on a grey canvas.
→

**E2.** One accent color total (`refs/` discipline) or the current five?
*Proposal:* one accent for *interaction*, the other four demoted to *status-only* roles.
→

**E3.** Per-section accent tinting (proposte→viola, segnalazioni→red…) — keep or drop?
*Proposal:* drop. It fights the `refs/` restraint and makes the product feel like five products.
→

**E4.** Is the crest red non-negotiable as the brand color?
→

**E5.** Light-first, dark-first, or genuinely equal?
*Proposal:* light-first (matches `refs/`), dark fully supported and shipped simultaneously.
→

**E6.** Should the theme respect system preference by default, or default to light?
→

**E7.** Do you want a high-contrast theme variant as a third option, given the public-sector
accessibility angle?
→

---

## F. Typography

**F1.** Keep Montserrat, or move to a neo-grotesque closer to `refs/`?
*Proposal:* move. `refs/` uses a tight neo-grotesque; Montserrat's geometric wide forms are
the main reason the current UI reads "template". Candidates, all self-hostable via
`next/font`: **Inter Tight**, **Geist**, **Instrument Sans**, **Schibsted Grotesk**.
→

**F2.** If moving — preference among those, or a licensed font you already own
(Neue Haas Grotesk, Söhne, ABC Diatype…)?
→

**F3.** A separate mono/technical face for figures and IDs?
*Proposal:* yes — **Geist Mono** or **JetBrains Mono** for protocol numbers, coordinates,
timestamps, tabular amounts.
→

**F4.** How extreme should the size contrast be? `refs/` runs ~11px labels against ~80px
display numerals.
*Proposal:* adopt the contrast; it is a large part of the effect.
→

**F5.** Italian typographic conventions — confirm: `1.234,56 €`, `25/07/2026`, 24h time,
capitalization "Sentence case" not "Title Case"?
→

**F6.** Should headings stay sentence-case Italian, or is there an appetite for the
lowercase-everything treatment `refs/` uses for the wordmark?
→

---

## G. Layout, density, responsiveness

**G1.** Current navigation is `side-nav` (desktop) + `bottom-nav` (mobile) + `top-bar`.
Keep this shape, or move toward the `refs/` model (persistent left filter rail + content)?
→

**G2.** With 30+ routes, the sidebar must be grouped. How many top-level groups feel right?
*Proposal:* 5 — Città · Soldi · Segnala · Partecipa · Tu.
→

**G3.** Density: airy everywhere (`refs/`), or airy for citizens and dense for data views
(current `DESIGN.md` §5)?
*Proposal:* keep the two-density rule; `refs/` is airy because it has ~10 data points per
screen, and Bilancio has hundreds.
→

**G4.** Max content width on large screens?
*Proposal:* 1440px, with the dashboard grid allowed to go full-bleed to 1680px.
→

**G5.** Is a bento/masonry dashboard grid wanted (`refs/` uses one), or a conventional
12-column grid?
*Proposal:* bento for La mia città and Bilancio overview; 12-col elsewhere.
→

**G6.** Should cards be user-rearrangeable (drag to reorder the dashboard)?
*Proposal:* no — cost is high, value for a civic audience is low.
→

**G7.** Smallest supported viewport?
*Proposal:* 360px.
→

**G8.** Tablet — a real target or just "large mobile"? `refs/7.jpg` is explicitly a tablet.
→

**G9.** Is there a TV/kiosk scenario (a screen in the Comune's lobby)? It would justify a
dedicated large-display mode.
→

---

## H. Component architecture & libraries *(blocking — see §0.3)*

**H1.** Which foundation?
- (a) **Keep hand-rolled Tailwind primitives**, port patterns from the references by hand
- (b) **Adopt Astryx** (`@astryxdesign/core`) as the primitive layer, Tailwind for layout only
- (c) **Adopt shadcn/ui** as the primitive layer, then pull Kokonut + bklit from their registries
- (d) Astryx for structure + shadcn registries for the flashy pieces

*Proposal:* **(c)**. Reasoning: bklit and Kokonut are both shadcn-registry-based, so shadcn/ui
is the common denominator that unlocks two of your five component references with a single
decision. Astryx is excellent and its agent tooling is genuinely useful, but it is Beta,
it duplicates the token layer, and its cascade-layer interaction with Tailwind v4 is a
standing maintenance risk — I'd rather mine it for *patterns* (its component taxonomy is
first-rate) than depend on it. Tell me if you want (b) or (d) and I'll take the integration
work seriously.
→

**H2.** If shadcn/ui: is it acceptable that components are copied into the repo (vendored,
you own and edit them) rather than installed as a versioned dependency?
→

**H3.** Are you willing to add these dependencies? Mark each yes/no:
- `shadcn/ui` primitives (vendored, no runtime dep) → 
- `@bklit/*` charts (shadcn registry) → 
- `@kokonutui/*` components (shadcn registry) → 
- `animejs` (~5–25KB, tree-shakeable) → 
- `gsap` + `@gsap/react` (required by most React Bits *text* components) → 
- `ogl` / `three` (required by React Bits *backgrounds*, 100KB+) → 
- `recharts` or `d3` (if bklit needs them) → 
→

**H4.** React Bits components are copy-paste with heavy per-component dependencies. Any you
specifically want? Realistic candidates for this project: `CountUp`, `SplitText`,
`ScrollReveal`, `AnimatedList`, `SpotlightCard`, `Magic Bento`, `Dot Grid`, `Grainient`.
*Proposal:* `CountUp` (replacing the existing `AnimatedNumber`), `AnimatedList`,
`SpotlightCard`, `Grainient` — and **no WebGL backgrounds** (Ferrofluid, Liquid Ether,
Galaxy, etc.) on a public service that must run on old Android phones.
→

**H5.** Uiverse elements are community CSS snippets of uneven quality and inconsistent
authorship. Use them at all?
*Proposal:* as *inspiration only*, never pasted in — they would fracture the system. Push
back if you want specific ones.
→

**H6.** Should the existing 4 charts (`line-chart`, `ring-gauge`, `sparkline`, `treemap`) be
replaced by bklit equivalents, or kept and restyled?
*Proposal:* keep `treemap` (bespoke, budget-specific, works), replace the other three.
→

**H7.** Do you want a component playground/storybook route (e.g. `/design-system`) to review
components in isolation?
*Proposal:* yes — a single internal route, not a Storybook install.
→

**H8.** Icons: stay on Lucide, or move to a set closer to `refs/` (thinner, more geometric)?
*Proposal:* stay on Lucide at stroke 1.5; it's already consistent and the difference is small.
→

---

## I. Data visualization

**I1.** For the Bilancio, which is the primary view: treemap (current), sunburst, sankey
(flows: entrate → missioni → programmi), or bar ranking?
*Proposal:* sankey as the hero for "where the money flows", treemap retained for drill-down.
bklit has both.
→

**I2.** Should charts animate on entry, and should they re-animate on filter change?
*Proposal:* animate once on entry; morph (not re-animate) on filter change.
→

**I3.** Is a text/table equivalent required for every chart (accessibility), or is a summary
sentence enough?
*Proposal:* summary sentence + expandable data table.
→

**I4.** Interaction depth: static, tooltip-on-hover, or full drill-down with brush/zoom?
*Proposal:* tooltip + drill-down; no brush (touch-hostile).
→

**I5.** Do you want the `refs/` **dot-scatter timeline** as a real component? It's the
distinctive chart in those images and would suit "activity over time" (segnalazioni per week,
opere milestones).
*Proposal:* yes — build it as a first-class custom chart. It's a signature piece.
→

**I6.** Chart color: single-hue sequential from the accent, or the five semantic colors?
*Proposal:* sequential from accent for quantities, semantic colors only for status.
→

**I7.** Are the mock numbers allowed to change to make charts look better, or must existing
seed data be preserved?
→

---

## J. Motion & interaction

**J1.** Overall intensity on a 1–5 scale (1 = fades only, 5 = reactbits.dev homepage)?
*Proposal:* **3** — confident and orchestrated, never ambient. A public body that jitters
looks unserious.
→

**J2.** Library split. Motion is already installed and is the only library that runs
scroll-linked animation on the browser's native `ScrollTimeline` (hardware-accelerated).
Anime.js v4 is better at SVG morphing, motion paths, drag physics and grid staggers.
*Proposal:* **Motion for everything React** (layout, gestures, presence, scroll);
**Anime.js only for SVG-native work** (crest draw-on, treemap cell morphs, map pin paths);
**no GSAP** unless you pick React Bits text components that require it.
→

**J3.** Page transitions — none, cross-fade, or shared-element (`layoutId` / View Transitions)?
*Proposal:* shared-element for list→detail (segnalazione card → segnalazione page), cross-fade
otherwise.
→

**J4.** Scroll-linked motion — how much? Parallax, reveal-on-scroll, scroll-driven progress,
sticky scroll-telling sections?
*Proposal:* reveal-on-scroll (once, never re-triggering) + one scroll-told section on
Bilancio explaining the budget. No parallax.
→

**J5.** Should numbers count up on entry?
*Proposal:* yes, once, ≤900ms, respecting reduced-motion — already exists as `AnimatedNumber`.
→

**J6.** Which moments deserve a genuine celebratory micro-interaction?
*Proposal:* three only — segnalazione submitted, proposta signed, segnalazione marked resolved.
→

**J7.** Hover states on desktop — subtle lift, spotlight-follow (Kokonut/React Bits style),
border glow, or none?
*Proposal:* subtle lift + a very restrained spotlight on clickable cards only.
→

**J8.** Loading: skeletons matching final layout, shimmer, or spinner?
*Proposal:* layout-matched skeletons; no spinners except inside buttons.
→

**J9.** Is `prefers-reduced-motion` an absolute kill-switch, or should a reduced-but-present
motion set remain?
*Proposal:* reduced-but-present — opacity transitions survive, transforms don't. Full removal
can make a UI feel broken.
→

**J10.** Haptics on mobile (`navigator.vibrate`) for primary confirmations?
→

---

## K. Accessibility

**K1.** Target: WCAG 2.1 AA, 2.2 AA, or AAA on text as currently claimed?
*Proposal:* 2.2 AA overall, AAA on body text.
→

**K2.** Does the acid-lime accent get an exemption as a non-text color, or must everything
pass contrast?
→

**K3.** Screen-reader testing — do you want me to actually verify with NVDA, or code to spec?
→

**K4.** Keyboard: is full keyboard operability required for charts and the map too?
*Proposal:* yes for charts (arrow-key data point traversal), best-effort for the Leaflet map.
→

**K5.** Should the dot-matrix numerals be exposed to assistive tech as plain numbers?
*Proposal:* yes, mandatory — visual treatment in `aria-hidden`, real number in an
`sr-only` span.
→

**K6.** Any commitment to an accessibility statement page (`dichiarazione di accessibilità`),
which is legally required for Italian public bodies?
→

---

## L. Content & tone of voice

**L1.** Confirm the informal "tu" civic register from `DESIGN.md` §3 stays?
→

**L2.** Should the redesign change any copy, or is copy frozen?
*Proposal:* microcopy in scope (labels, empty states, errors), body content frozen.
→

**L3.** Chart titles that state the conclusion ("Dove vanno i soldi") rather than the
dimension ("Spesa per missione") — keep this rule?
*Proposal:* keep. It's one of the best decisions in the current DESIGN.md.
→

**L4.** Is English localization ever coming, or is Italian permanent?
*Proposal:* Italian permanent; no i18n scaffolding (it would slow everything for no gain).
→

**L5.** **In which language should the documentation be written?** Existing docs
(`DESIGN.md`, `ROADMAP.md`, `DOCUMENTATION.md`) are Italian; you write to me in English.
*Proposal:* Italian, to match the existing corpus.
→

---

## M. Technical constraints

**M1.** Performance budget — is there a Lighthouse or Core Web Vitals target?
*Proposal:* LCP < 2.0s on mid-tier mobile, CLS < 0.05, ≤200KB JS on first load.
→

**M2.** Browser support floor?
*Proposal:* last 2 versions of evergreen browsers + iOS Safari 16. This matters — it decides
whether I can use `@container`, `:has()`, View Transitions, and CSS `color-mix()`.
→

**M3.** Is Server Components / streaming architecture something to preserve carefully, or is
converting pages to client components acceptable for animation?
*Proposal:* preserve RSC; `motion/react` supports it, and `"use client"` should stay at the
leaf level.
→

**M4.** Any hosting target that constrains things (Vercel, self-hosted, static export)?
Current setup is SQLite + Prisma, which rules out most serverless.
→

**M5.** Is the existing test suite (Vitest + Playwright) to be maintained through the
redesign? Playwright snapshots will all break.
*Proposal:* yes, maintained; regenerate snapshots per wave.
→

**M6.** Bundle-size ceiling for animation libraries specifically?
→

**M7.** Should I run `graphify update .` after each wave, per `CLAUDE.md`?
*Proposal:* yes.
→

---

## N. Process & documentation

**N1.** Confirm the six documents to produce: `AGENTS.md`, `ROADMAP.md`, `ARCHITECTURE.md`,
`SECURITY.md`, `FEATURES.md`, `DESIGN.md`. Note that `ROADMAP.md` (37KB) and `DESIGN.md`
(9.6KB) already exist and are good — should I rewrite or extend them?
*Proposal:* extend `ROADMAP.md`, rewrite `DESIGN.md` (its visual direction is being replaced),
create the other four new.
→

**N2.** `DOCUMENTATION.md` (51KB) currently holds architecture + security + data model.
Split it into `ARCHITECTURE.md` + `SECURITY.md` and leave a stub, or duplicate?
*Proposal:* split, with `DOCUMENTATION.md` becoming an index.
→

**N3.** Where should the reference analysis live — a dedicated `REFERENCES.md`, or a section
inside `DESIGN.md`?
*Proposal:* a dedicated `REFERENCES.md`, linked from `DESIGN.md` and `AGENTS.md`. It is
substantial enough (seven sources, each with a "when to prefer this" rule) to stand alone.
→

**N4.** `AGENTS.md` — should it be at repo root, inside `pistoia-dashboard/`, or both?
There is currently a stub at `pistoia-dashboard/AGENTS.md` with Next.js rules, and
`pistoia-dashboard/CLAUDE.md` imports it via `@AGENTS.md`.
*Proposal:* the real one at repo root; keep the app-level stub and have it link upward.
→

**N5.** Commit granularity — one commit per wave (matching current history), or smaller?
*Proposal:* match existing history: one feature commit per wave, Italian commit messages.
→

**N6.** Do you want to review each wave before I continue, or should I run several waves
autonomously?
→

**N7.** Should I produce visual previews (screenshots via Playwright, or a published
artifact) at the end of each wave for your review?
*Proposal:* yes — screenshots of the flagship pages, light and dark.
→

---

## O. Open questions I could not resolve alone

**O1.** `refs/` is untracked in git (`?? refs/`). Should it be committed, gitignored, or
moved into `docs/`?
→

**O2.** The images in `refs/` are someone else's published design work (credited
`@rondesignlab`, showing the "Superpower" product). I'll treat them as *directional
inspiration* — adopting layout logic, density, and motion principles — and will not
reproduce their brand, wordmark, or copy. Confirm that's your intent.
→

**O3.** Is there any brand asset from the Comune di Pistoia (official logo, color spec,
font licence) that I should be respecting or deliberately avoiding?
→
