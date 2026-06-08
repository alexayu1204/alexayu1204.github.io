# UI/UX Audit & Improvement Plan — Haoting (Alexa) Yu, Personal Website

> **Status:** Read-only analysis. No site files were modified. This document is the deliverable.
> **Date:** 2026-06-07
> **Scope:** `index.html` (856 lines), `style/main.css` (963 lines), `js/main.js` (290 lines), `README.md`, `assets/`, `style/github-markdown.css` (vendored).
> **Method:** First-hand line-by-line reading + `grep`-verified evidence, cross-checked by a 7-dimension multi-agent audit with an adversarial verifier per dimension (see [§9 Verification Addendum](#9-multi-agent-verification-addendum)).
> **Audience reality:** This is the personal site of a *creative-computing researcher / AI & data scientist / poet & artist* — it is read by academic reviewers, industry recruiters, and creative collaborators. The bar is "polished, modern, credible, and a little distinctive," not "generic Bootstrap template."

---

## 1. Executive Summary

The site is **functional, well-organized, and already does several things right**: a clean orange-accent theme with light/dark modes, a recently-added Research section with WCAG-considered badge contrast (documented inline in `main.css:880–963`), an animated section-underline detail (`main.css:191–206`), a horizontal portfolio carousel with touch support, and a modular HTML/CSS/JS split. The content is strong and current (2026 résumé, three in-progress publications).

But it reads as a **capable template build rather than a distinctive personal brand**, and it carries a cluster of issues that are individually small yet collectively undercut credibility and accessibility. The five themes that matter most:

1. **First-impression & trust signals are thin.** The `<head>` has only `charset/viewport/title` — no meta description, favicon, Open Graph, or Twitter card (`index.html:3–21`). Every time this link is shared on LinkedIn/Slack/Twitter it renders as a blank, unbranded preview. The hero (`index.html:80–95`) is a centered name + 3 icons + one tagline — it states *who* but not *what / where / why-care*, and offers no primary call-to-action.

2. **Placeholder art on a creative portfolio.** 11 portfolio thumbnails are `dummyimage.com` colored boxes reading "Poem+Gen", "EV+Charging", etc. (`index.html:545–692`). For an *artist's* portfolio, generic placeholder rectangles are the single most damaging visual element on the page, and they are an external network dependency that can fail.

3. **Accessibility gaps that are quick to fix but real.** The dark-mode toggle is a `<span role="button">` with no `tabindex` and no keyboard handler — **keyboard users cannot toggle the theme** (`index.html:69`, `js/main.js:141`). Focus outlines are removed on the carousel buttons (`main.css:406`). Heading order is out of sequence (h1 → h3 → h2 → h5 → h6). There is **no `prefers-reduced-motion` support at all** despite the README claiming it (27 `data-aos` elements animate unconditionally).

4. **A dark-mode architecture fighting itself.** Dark mode is implemented three different ways at once — ~400 lines of escalating `!important` CSS overrides (`main.css:654–847`), an injected `<style>` tag, *and* per-element inline styles set in JS (`js/main.js:87–128`) — all to override Bootstrap. Bootstrap 5.3 ships a native color-mode system (`data-bs-theme`) that would delete most of this. There's also a **flash of light theme (FOUC)** for returning dark-mode users because `<body data-theme="light">` is hard-coded and theme is only applied after `DOMContentLoaded`.

5. **Content architecture has redundancy and a weak skills story.** Every "Project Experience" accordion item is duplicated as a Portfolio card with inconsistent titles/metrics; "Contact," "Online Profiles," and the header icons overlap; and the 28-item flat skills list (`index.html:379–410`) is uncategorized despite the README claiming categories.

None of this requires a framework change or a rebuild. The highest-impact fixes are **trivial-to-small effort** (meta tags, real `<button>`, `:focus-visible`, `prefers-reduced-motion`, an inline anti-FOUC script, replacing placeholders). The rest is a tasteful, native-CSS-forward polish pass described in [§8 Design North-Star](#8-design-north-star).

---

## 2. Scorecard

| Dimension | Grade | Headline issue |
|---|---|---|
| **Visual design / brand** | C+ | Placeholder images + generic-template feel; flat single-accent palette; thin hero |
| **Accessibility (WCAG 2.2 AA)** | C− | Keyboard-inaccessible theme toggle; removed focus outlines; heading order; no reduced-motion; **white-on-orange 2.53:1 / tagline 4.45:1 contrast fails** |
| **Responsive / mobile** | B− | 8-link navbar crowds at tablet widths; `white-space:nowrap` hero; only 2 breakpoints; fixed iframe heights |
| **Performance / infrastructure** | C+ | 7 render-blocking CDNs (full Font Awesome for ~10 icons); dark-mode FOUC; unpinned `marked`; no SEO/social meta |
| **Information architecture / content** | B− | Project/Portfolio duplication; contact triplication; uncategorized skills; hero lacks value prop |
| **Semantics / code quality** | C+ | 400-line `!important` dark-mode war; triple-implemented theming; 24 inline styles; README drift |
| **Interaction / motion** | B− | Carousel arrows never disable; no scroll-snap/scrollspy; AOS hides content if JS fails; hover-only affordances |

> Grades are relative to "a distinctive, accessible, modern personal site," not to "a working webpage." As a *working* webpage it is solidly functional.

---

## 3. Prioritized Roadmap

Effort: **T** = trivial (<5 min) · **S** = small (<30 min) · **M** = medium (hours) · **L** = large.

### P0 — Quick wins (high impact, trivial/small effort) — do these first
| # | Fix | Why | Effort | Ref |
|---|---|---|---|---|
| 1 | Add `<meta name="description">`, favicon, Open Graph + Twitter card, `theme-color`, canonical | Branded, professional link previews everywhere the site is shared | S | [4.4.1](#441-no-se--social-metadata) |
| 2 | Make the theme toggle a real `<button>` with `aria-pressed` (or add `tabindex=0` + keydown) | Keyboard users currently cannot switch themes | T | [4.2.1](#421-theme-toggle-is-keyboard-inaccessible) |
| 3 | Replace `outline:none` (`main.css:406`) with `:focus-visible` rings site-wide | Restores keyboard focus visibility | T | [4.2.2](#422-focus-outline-removed) |
| 4 | Add `@media (prefers-reduced-motion: reduce)` to disable AOS/transitions | Vestibular-safety + honors README's own claim | S | [4.2.4](#424-no-reduced-motion-support) |
| 5 | Add an inline anti-FOUC `<head>` script + `prefers-color-scheme` default | Kills the light→dark flash for returning users; respects OS preference | S | [4.4.2](#442-dark-mode-fouc) |
| 6 | Move `scroll-behavior:smooth` from `body` to `html` (`main.css:48`) | Reliable smooth anchor scrolling | T | [4.6.4](#464-scroll-behavior-on-the-wrong-element) |
| 7 | Pin `marked` to a version (`marked@12`) | Removes a silent supply-chain/breakage risk | T | [4.4.4](#444-unpinned-marked) |

### P1 — High-value polish (clear UX gain)
| # | Fix | Why | Effort | Ref |
|---|---|---|---|---|
| 8 | Replace all `dummyimage.com` placeholders with real project visuals (or tasteful generated CSS art) | Biggest single visual credibility win | M | [4.1.1](#411-placeholder-images) |
| 9 | Redesign the hero: value prop, location, primary CTA(s), refined type | Stronger first impression | M | [4.5.4](#454-hero-lacks-value-proposition--cta) |
| 10 | Add `scroll-snap` + disabled-at-ends state + scrollbar affordance to the carousel | Discoverability + control | S | [4.7.1](#471-carousel-arrows-never-disable--no-scroll-snap) |
| 11 | Add IntersectionObserver scrollspy to highlight the active nav section | Orientation on a long single page | S | [4.7.4](#474-no-active-section-nav-indication-scrollspy) |
| 12 | Categorize the skills list (Languages / ML & AI / Data & BI / Creative) | Scannability; matches README | S | [4.5.3](#453-skills-are-an-uncategorized-28-item-blob) |
| 13 | Resolve Project Experience ↔ Portfolio duplication & metric inconsistencies | Removes confusion, tightens narrative | M | [4.5.1](#451-projectportfolio-duplication) |

### P2 — Infrastructure & maintainability
| # | Fix | Why | Effort | Ref |
|---|---|---|---|---|
| 14 | Migrate dark mode to Bootstrap-native `data-bs-theme` + a small token layer; delete the `!important` war and the JS style injection | ~400 fewer CSS lines, no JS theming hacks | M | [4.6.1](#461-the-dark-mode-important-war) |
| 15 | Subset/replace Font Awesome (inline SVG for ~10 icons); self-host fonts; `preconnect`/`preload` | Fewer/faster requests, fewer 3rd parties | M | [4.4.3](#443-heavy-render-blocking-cdns) |
| 16 | Replace AOS with native scroll-driven animations / a tiny IntersectionObserver; ensure no-JS content visibility | Removes a library; fixes "content vanishes if JS fails" | M | [4.7.3](#473-aos-hides-content-if-js-fails) |
| 17 | Move 24 inline `style=""` to CSS classes/tokens | Maintainability, CSP-friendliness | S | [4.6.2](#462-24-inline-styles) |

### P3 — Nice-to-have / distinctive
| # | Fix | Why | Effort | Ref |
|---|---|---|---|---|
| 18 | Showcase the poetry/photography/textile side as first-class visual content, not just links | Differentiation; matches the "poet & artist" identity | M–L | [§8](#8-design-north-star) |
| 19 | Add JSON-LD `Person` structured data | Rich SEO / knowledge-graph eligibility | S | [4.4.1](#441-no-se--social-metadata) |
| 20 | Print stylesheet for the résumé page | Clean printing of a résumé site | S | [4.3.5](#435-misc-responsive--print) |
| 21 | Remove orphaned `roboticsDemoModal` (no trigger references it) | Dead code | T | [4.6.5](#465-dead--inconsistent-markup) |

> **→ 22 additional prioritized items** surfaced by the independent verification pass (white-on-orange contrast, no-JS AOS guard, `<main>`/skip link, accordion brand-blue clash, section reorder, keyboard carousel nav, …) are tabled in [§9.2 Net-new priority items](#92-net-new-priority-items-slot-into-the-3-roadmap).

---

## 4. Detailed Findings by Dimension

Each finding: **Problem → Evidence (file:line) → Why it matters → Native fix (snippet) → Severity / Effort.**

### 4.1 Visual Design & Brand

#### 4.1.1 Placeholder images
- **Problem:** 11 portfolio thumbnails are `dummyimage.com` solid-color boxes with overlaid text.
- **Evidence:** `index.html:545,561,576,591,606,621,635,649,663,677,692` — e.g. `src="https://dummyimage.com/600x400/007bff/ffffff&text=Poem+Gen"`. Note these are still **blue (`007bff`)** — the *old* pre-orange brand color, clashing with the current `#ff7f00` theme.
- **Why it matters:** On an artist's portfolio, placeholder rectangles read as "unfinished." They are also an external dependency (can fail / slow) and visually inconsistent with the brand.
- **Native fix:** Replace with real screenshots/figures (even a single representative figure per project — a loss curve, a generated poem card, a detection bounding-box crop). Where no image exists, generate tasteful on-brand CSS gradient + glyph cards locally (no network):
  ```css
  .thumb-fallback{
    aspect-ratio: 3 / 2;
    display: grid; place-items: center;
    background:
      radial-gradient(120% 120% at 0% 0%, color-mix(in oklab, var(--primary-color) 25%, transparent), transparent 60%),
      linear-gradient(135deg, color-mix(in oklab, var(--primary-color) 12%, var(--card-bg)), var(--card-bg));
    color: color-mix(in oklab, var(--primary-color) 70%, var(--text-color));
    font: 600 1rem/1.2 'Roboto', sans-serif;
  }
  ```
- **Severity:** High · **Effort:** M

#### 4.1.2 Flat single-accent palette
- **Problem:** The whole UI rides on one orange (`--primary-color: #ff7f00`) with grey text. No supporting accent, no tonal scale → "template" flatness.
- **Evidence:** `main.css:10–36` (`:root` / `[data-theme="dark"]`).
- **Native fix:** Build a tonal scale with `color-mix()` / `oklch()` and a single restrained secondary accent. See [§8](#8-design-north-star) for the proposed token set.
- **Severity:** Medium · **Effort:** S–M

#### 4.1.3 Typography is one-note
- **Problem:** Only Roboto 400/500/700, fixed `rem` sizes, no fluid scale, no distinctive display face for the name/hero. Long About paragraphs run wide on desktop (no `max-width`/measure cap on body copy inside the 1100px container).
- **Evidence:** `index.html:12`; `main.css:43–50`, `.header h1{font-size:2.5rem}` (`:129–135`), About `<p>` at `index.html:100–113`.
- **Native fix:** Pair a characterful display serif/grotesk for the name with Roboto for body; fluid type via `clamp()`; cap measure at ~68ch:
  ```css
  .header h1{ font-size: clamp(2rem, 1.2rem + 3.5vw, 3.25rem); }
  .info-card p{ max-width: 68ch; }
  ```
- **Severity:** Medium · **Effort:** S

#### 4.1.4 Elevation / radius consistency
- **Problem:** Shadows and radii are repeated literals (`border-radius:10px`, `box-shadow:0 4px 12px rgba(0,0,0,.05)`) scattered across `.info-card`, `.project-card`, `.portfolio-card` rather than tokens.
- **Evidence:** `main.css:167–181, 422–440, 487–501`.
- **Native fix:** `--radius`, `--shadow-1/2`, `--ring` custom properties; reference everywhere.
- **Severity:** Low · **Effort:** S

---

### 4.2 Accessibility (WCAG 2.2 AA)

#### 4.2.1 Theme toggle is keyboard-inaccessible
- **Problem:** The dark-mode control is a `<span role="button">` with **no `tabindex`** and the JS binds only `click` — so it is unreachable by keyboard and exposes no pressed state.
- **Evidence:** `index.html:69` `<span class="nav-link theme-toggle" id="theme-toggle" role="button" aria-label="Toggle Dark Mode">`; `js/main.js:141` `themeToggle.addEventListener('click', …)`.
- **Why it matters:** WCAG 2.1.1 (Keyboard). A custom `role="button"` must be focusable and operable with Enter/Space.
- **Native fix:** Use a real `<button>` and reflect state with `aria-pressed`:
  ```html
  <button id="theme-toggle" class="nav-link theme-toggle" type="button"
          aria-pressed="false" aria-label="Toggle dark mode">
    <i class="fas fa-moon" aria-hidden="true"></i>
  </button>
  ```
  ```js
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  ```
- **Severity:** Critical (a11y) · **Effort:** T

#### 4.2.2 Focus outline removed
- **Problem:** Carousel navigation buttons remove the focus ring.
- **Evidence:** `main.css:405–407` `.projects-nav-btn:focus{ outline: none; }`.
- **Why it matters:** WCAG 2.4.7 (Focus Visible).
- **Native fix:** Delete it; add a global modern focus ring:
  ```css
  :where(a, button, [tabindex]):focus-visible{
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 6px;
  }
  ```
- **Severity:** High (a11y) · **Effort:** T

#### 4.2.3 Heading order is non-sequential
- **Problem:** `<h1>` (name) → section titles are `<h3>` (skips h2) → each accordion item is `<h2>` **nested inside** the `<h3>` section → cards use `<h5>`, profiles `<h6>` (no `<h4>`). Counts: 1×h1, 19×h2, 10×h3, 15×h5, 5×h6.
- **Evidence:** `index.html:81` (h1), `99` (h3 "About Me"), `123` (h2 accordion inside it), `548` (h5 card), `717` (h6 profile).
- **Why it matters:** WCAG 1.3.1 / 2.4.10. Screen-reader users navigate by heading level; a section titled `h3` that contains `h2` children is logically inverted.
- **Native fix:** Section titles → `<h2>`; accordion item headings → `<h3>`; card titles → `<h4>`/`<h3>`. Keep visual size via classes, not heading level.
- **Severity:** Medium (a11y) · **Effort:** S

#### 4.2.4 No reduced-motion support
- **Problem:** Zero `prefers-reduced-motion` rules; 27 `data-aos` elements + many CSS transitions animate unconditionally. README line 137 claims the opposite.
- **Evidence:** `grep prefers-reduced-motion` → none in `index.html/main.css/js`; `data-aos` ×27.
- **Native fix:**
  ```css
  @media (prefers-reduced-motion: reduce){
    *, *::before, *::after{ animation-duration:.001ms!important; animation-iteration-count:1!important; transition-duration:.001ms!important; scroll-behavior:auto!important; }
    [data-aos]{ opacity:1!important; transform:none!important; }
  }
  ```
  ```js
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  AOS.init({ duration: 700, once: true, disable: reduce });
  ```
- **Severity:** Medium (a11y) · **Effort:** S

#### 4.2.5 Inconsistent / purposeless `tabindex="0"`
- **Problem:** 5 of 11 project cards have `tabindex="0"` (no role, no action on the card itself — the actions are the inner links), the other 6 don't. This adds confusing, inconsistent tab stops for keyboard/SR users.
- **Evidence:** `index.html:543,559,574,589,604` have it; `619,633,647,661,675,690` don't.
- **Native fix:** Remove `tabindex` from the card wrappers; let the inner `<a>`/`<button>` be the focusable targets. If the whole card should be clickable, make a single semantic link and use the "card link" pattern.
- **Severity:** Low (a11y) · **Effort:** T

#### 4.2.6 `target="_blank"` on `mailto:` / `tel:` + missing skip link
- **Problem:** Header `mailto:`/`tel:` links use `target="_blank"` (meaningless for mail/phone handlers). No skip-to-content link; no `aria-current` on nav.
- **Evidence:** `index.html:83,87`; no `skip`/`aria-current` anywhere.
- **Native fix:** Drop `target="_blank"` from mail/tel; add a skip link as the first focusable element:
  ```html
  <a class="visually-hidden-focusable" href="#about">Skip to content</a>
  ```
- **Severity:** Low (a11y) · **Effort:** T

#### 4.2.7 Secondary-text contrast fails AA (computed)
- **Problem:** `--secondary-color:#6c757d` on the hero tagline (1.2rem / weight 500) computes to **4.45:1** on `#f8f9fa` — just *under* the 4.5:1 AA threshold (19.2px/500 does not qualify for the large-text 3:1 exemption, which needs 18.66px bold or 24px).
- **Evidence:** `main.css:14,155–160`; tagline `index.html:94`. *(Ratio computed by the verification pass.)*
- **Native fix:** Nudge the token darker — `#5a6268` = **5.89:1** on `#f8f9fa` — or bind it to the text color so it can't drift: `--secondary-color: color-mix(in srgb, var(--text-color) 70%, var(--bg-color))`.
- **Severity:** Medium · **Effort:** T

#### 4.2.8 Brand orange fails contrast as a text/UI surface (2.53:1)
- **Problem:** White text/glyphs on the brand `#ff7f00` compute to **2.53:1** — below 4.5:1 (normal text) *and* below 3:1 (large text + non-text UI components, SC 1.4.11). This hits real elements: the back-to-top chevron, the carousel arrow glyphs, and table headers.
- **Evidence:** `main.css:13` (`--primary-color`), `279–280` (`#backToTop` white-on-orange), `388–389` (`.projects-nav-btn`), `638–642` (`th`). *(Computed by verification.)*
- **Native fix:** Derive an AA "on-primary" surface and use it wherever white sits on the brand — white on `#b35900` = **4.83:1**:
  ```css
  :root{ --primary-strong: color-mix(in srgb, var(--primary-color) 70%, black); } /* ≈ #b35900 */
  .projects-nav-btn, #backToTop, th{ background: var(--primary-strong); }
  ```
  (The existing `--button-hover-bg:#cc6600` is only 3.84:1 — fine as a 3:1 *non-text* surface, insufficient for white text.)
- **Severity:** High (a11y) · **Effort:** S

---

### 4.3 Responsive & Mobile UX

#### 4.3.1 Navbar crowds at tablet widths
- **Problem:** `navbar-expand-lg` keeps 8 text links + CV icon + theme toggle inline until ≥992px. Between ~768–991px these 10 items crowd/wrap awkwardly; the labels are long ("Work Experience", "Project Experience", "Technical Skills").
- **Evidence:** `index.html:25,37–72`.
- **Native fix:** Either `navbar-expand-xl` (collapse earlier) or shorten labels (Work, Projects, Skills) and/or make the nav a slim icon+label set. Consider a sticky condensed nav on scroll.
- **Severity:** Medium · **Effort:** S

#### 4.3.2 `white-space:nowrap` on the hero name
- **Problem:** `.header h1{ white-space:nowrap }` forces the name onto one line; on very narrow screens this can force horizontal overflow (masked by `body{overflow-x:hidden}`, which hides the symptom rather than fixing it).
- **Evidence:** `main.css:133`; `body{overflow-x:hidden}` `main.css:47`.
- **Native fix:** Allow wrapping with balanced lines and fluid sizing:
  ```css
  .header h1{ white-space: normal; text-wrap: balance; font-size: clamp(2rem, 1.2rem + 3.5vw, 3.25rem); }
  ```
- **Severity:** Low · **Effort:** T

#### 4.3.3 Only two breakpoints
- **Problem:** Custom media queries exist only at `max-width:768px` and `576px`. The 577–767px band and large screens (>1100px) get no fine-tuning; the carousel card is `flex 0 0 85%` only below 768.
- **Evidence:** `main.css:548,573`.
- **Native fix:** Prefer intrinsic sizing (`clamp()`, `min()`, `auto-fit minmax()`) so fewer breakpoints are needed; add container queries for the cards.
- **Severity:** Low · **Effort:** M

#### 4.3.4 Fixed modal iframe heights
- **Problem:** Resume modal iframe is `height:800px`, preview iframe `600px` (inline) — on short/mobile viewports these overflow or letterbox.
- **Evidence:** `index.html:806` (`height="800px"`), `826`; `js/main.js:264` (`previewFrame.height='600px'`).
- **Native fix:** Use `height: min(80vh, 1000px)` via a class; for the résumé prefer `modal-fullscreen-sm-down` (already used on the preview modal) and a viewport-relative height.
- **Severity:** Low · **Effort:** S

#### 4.3.5 Misc responsive / print
- **Problem:** No print stylesheet for what is fundamentally a résumé; printing renders the fixed navbar, dark shadows, and collapsed accordions.
- **Native fix:** A small `@media print` block: hide nav/back-to-top, expand accordions, force light tokens, show full URLs.
- **Severity:** Low · **Effort:** S

---

### 4.4 Performance & Infrastructure

#### 4.4.1 No SEO / social metadata
- **Problem:** `<head>` contains only `charset`, `viewport`, `title`. No `description`, favicon, Open Graph, Twitter card, `theme-color`, or canonical.
- **Evidence:** `index.html:3–21`.
- **Why it matters:** Shared links show blank/unbranded previews; weaker search presentation.
- **Native fix:**
  ```html
  <meta name="description" content="Haoting (Alexa) Yu — creative-computing researcher, AI & data scientist, poet. MRes Creative Computing (UAL). MRAG, drum transcription, AI-art authorship.">
  <meta name="theme-color" content="#ff7f00">
  <link rel="canonical" href="https://alexayu1204.github.io/">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="Haoting (Alexa) Yu — Creative Computing Researcher">
  <meta property="og:description" content="AI & data scientist · poet & artist. Research in creative AI, MRAG, and music information retrieval.">
  <meta property="og:image" content="https://alexayu1204.github.io/assets/og-card.png">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  ```
  Plus JSON-LD `Person` for rich results.
- **Severity:** High · **Effort:** S

#### 4.4.2 Dark-mode FOUC
- **Problem:** `<body data-theme="light">` is hard-coded and the saved theme is applied only inside `DOMContentLoaded`, so a returning dark-mode visitor sees a **flash of light** before JS runs. First-time visitors never get their OS `prefers-color-scheme`.
- **Evidence:** `index.html:22`; `js/main.js:82–138`.
- **Native fix:** A tiny render-blocking script in `<head>` (before CSS paint) that sets the attribute from storage or OS preference:
  ```html
  <script>
    (function(){
      var t = localStorage.getItem('theme')
        || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
  ```
  (Move the attribute to `<html>` so it's set before `<body>` exists.)
- **Severity:** Medium · **Effort:** S

#### 4.4.3 Heavy render-blocking CDNs
- **Problem:** 7 external resources gate rendering/interactivity for a mostly-static page: Bootstrap CSS + JS, **full Font Awesome 6.4** (huge, for ~10 glyphs), AOS CSS + JS, Google Fonts, marked.
- **Evidence:** `index.html:8,10,12,14,20,849,851`.
- **Native fix:** Inline the ~10 icons as SVG (drop Font Awesome entirely); self-host the one font weight set with `font-display:swap`; `defer` non-critical JS; add `preconnect`/`preload` for anything kept; load `marked` only when a report modal opens (dynamic import). This can cut several hundred KB and 4–5 requests.
- **Severity:** Medium · **Effort:** M

#### 4.4.4 Unpinned `marked`
- **Problem:** `marked` is loaded with no version (`/npm/marked/marked.min.js`) → always "latest"; a breaking release silently breaks report previews; supply-chain surface.
- **Evidence:** `index.html:20`.
- **Native fix:** Pin (`marked@12`) + optional `integrity`/SRI, or load on demand.
- **Severity:** Medium · **Effort:** T

#### 4.4.5 External-embed functional risk (preview modal)
- **Problem:** "Preview" buttons load `alexy1204.wixsite.com/*` into an iframe; many hosts (Wix included) send `X-Frame-Options: SAMEORIGIN`/CSP `frame-ancestors`, so the preview can render **blank**. The markdown branch is robust; the iframe branch is fragile.
- **Evidence:** `index.html:683,698,730,737`; `js/main.js:259–281`.
- **Native fix:** Detect load failure and fall back to a "Open in new tab" card with a static thumbnail; or skip the iframe preview for known-unframeable hosts.
- **Severity:** Medium · **Effort:** S

#### 4.4.6 Unthrottled scroll handler
- **Problem:** `backToTop` visibility is recomputed on every `scroll` event with a synchronous style write.
- **Evidence:** `js/main.js:53–55`.
- **Native fix:** Replace with an IntersectionObserver sentinel (no scroll listener), or throttle via `requestAnimationFrame`.
- **Severity:** Low · **Effort:** S

---

### 4.5 Information Architecture & Content

#### 4.5.1 Project/Portfolio duplication
- **Problem:** All 6 "Project Experience" accordion items reappear as Portfolio carousel cards, sometimes with **different titles and metrics**, creating confusion about which is canonical.
- **Evidence:** Accordion `index.html:424–529` vs carousel `index.html:543–702`. Examples: accordion "Anomaly Detection and Forecasting in Power Systems" (`:445`) vs card "Anomaly detection" (`:594`); the Sentiment **card** claims "RoBERTa-based model achieving 87.06% accuracy" (`:580`) while the **accordion** says BERT/BoW/TF-IDF with no such figure (`:488`).
- **Native fix:** Pick one model. Recommended: make **Portfolio** the single visual project gallery (with links + reports) and reduce "Project Experience" to a tight résumé-style list, *or* merge into one "Selected Projects" section with consistent titles/metrics. Reconcile the divergent numbers against the résumé.
- **Severity:** Medium · **Effort:** M

#### 4.5.2 Contact information triplicated
- **Problem:** Email/phone/links appear in the header icons (`:82–93`), "Online Profiles" (`:711–746`), and "Contact" (`:763–769`) — three overlapping surfaces.
- **Native fix:** Consolidate to one authoritative Contact block + the header icons as quick links; fold "Online Profiles" into Contact or a compact footer row.
- **Severity:** Low · **Effort:** S

#### 4.5.3 Skills are an uncategorized 28-item blob
- **Problem:** A flat pill list of 28 items mixes languages, frameworks, BI tools, and creative skills with no grouping. README line 176 claims "Categorized skills" — drift.
- **Evidence:** `index.html:379–410`.
- **Native fix:** Group into **Languages** (Python, R, SQL, MATLAB, C++, JS) · **ML & AI** (PyTorch, TensorFlow, scikit-learn, Multimodal/Generative AI, LangChain, prompt eng.) · **Data & BI** (Pandas, NumPy, SciPy, Power BI, Tableau, Origin) · **Creative** (Textile, Photography, Writing) · **Languages (spoken)**. Use `<h4>` subgroups or a definition list.
- **Severity:** Medium · **Effort:** S

#### 4.5.4 Hero lacks value proposition / CTA
- **Problem:** Hero = name + 3 icons + one tagline. No location, no one-line "what I do / what I'm looking for," no primary CTA (View CV / Read research / Email).
- **Evidence:** `index.html:80–95`.
- **Native fix:** Add a single value-prop line, location ("London / Reading, UK"), and 2 CTAs (primary "View résumé", secondary "Research"). See [§8](#8-design-north-star).
- **Severity:** Medium · **Effort:** S

#### 4.5.5 Content nits
- **Problem:** Phone displayed as `+44 0 7831223687` — in E.164/international form the trunk `0` is dropped (the `tel:` href correctly uses `+447831223687`). Default-collapsed Research/Work accordions hide the strongest content (publications) behind a click.
- **Evidence:** `index.html:766`; accordions all `collapsed` by default.
- **Native fix:** Display `+44 7831 223687`. Consider expanding the first Research item by default, or surfacing a "Selected publications" teaser in/under the hero.
- **Severity:** Low · **Effort:** T

---

### 4.6 Semantics & Code Quality

#### 4.6.1 The dark-mode `!important` war
- **Problem:** Dark mode is implemented by overriding Bootstrap with ~400 lines of increasingly specific `!important` rules — plus the JS injects a `<style>` tag *and* sets inline styles, i.e. **three** parallel mechanisms for the same effect.
- **Evidence:** `main.css:654–847` (overrides); `js/main.js:87–100` (`updateSkillsStyles` inline), `103–128` (`updateDarkModeStyles` injected `<style>`). The CSS already has `[data-theme="dark"] .skills ul li{…!important}` (`main.css:232–237`), so the JS is redundant.
- **Native fix:** Adopt Bootstrap 5.3's native color modes: set `data-bs-theme="dark"` on `<html>` (alongside your `data-theme` token) and delete the override blocks + both JS style functions. Keep a thin token layer (`:root` / `[data-theme=dark]`) only for your custom (non-Bootstrap) components.
- **Severity:** Medium (maintainability) · **Effort:** M

#### 4.6.2 24 inline styles
- **Problem:** 24 `style=""` attributes (mostly `font-size:0.9rem` on date spans, profile-icon colors, iframe heights) bypass the stylesheet and block a strict CSP.
- **Evidence:** `index.html` lines 191, 211, 230, 249, 267, 285, 304, 331, 347, 363, 428, 446, 464, 482, 500, 518, 716, 722, 728, 735, 742, 806, 826, 841.
- **Native fix:** `.exp-date{ font-size:.9rem; color:var(--secondary-color); }`, `.profile-icon--linkedin{ color:#0077B5 }`, `.embed--tall{ height:min(80vh,800px) }` etc.
- **Severity:** Low · **Effort:** S

#### 4.6.3 README documentation drift
- **Problem:** README states `--primary-color:#d35400` for dark mode (actual: `#ff9933`, `main.css:27`), claims `prefers-reduced-motion` support (none exists), and "categorized skills" (they're flat).
- **Evidence:** `README.md:65,137,176` vs the code.
- **Native fix:** Update README to match, or (better) fix the code to match the (good) intentions the README describes.
- **Severity:** Low · **Effort:** S

#### 4.6.4 `scroll-behavior` on the wrong element
- **Problem:** `scroll-behavior:smooth` is set on `body` (`main.css:48`); the document's scrolling element is `<html>`, so smooth anchor scrolling is unreliable. (The second occurrence at `:369` on the carousel is correct.)
- **Native fix:** Move it to `html{ scroll-behavior:smooth }` (and gate it behind `prefers-reduced-motion`).
- **Severity:** Low · **Effort:** T

#### 4.6.5 Dead / inconsistent markup
- **Problem:** `roboticsDemoModal` (`index.html:781–795`, a YouTube embed) has **no trigger** anywhere referencing `#roboticsDemoModal` → dead code. Card markup is hand-repeated 11× (data-driving it would reduce drift like the title/metric mismatches above).
- **Native fix:** Remove the orphan modal; consider rendering cards from a small JS/JSON array (or build step) so titles/metrics have one source of truth.
- **Severity:** Low · **Effort:** T–M

---

### 4.7 Interaction Design & Motion

#### 4.7.1 Carousel arrows never disable / no scroll-snap
- **Problem:** Left/right buttons are always enabled (even at the ends) and there's no `scroll-snap`, no position indicator, and the scrollbar is hidden — so "there are more cards" is under-communicated and control feels loose.
- **Evidence:** `main.css:365–415` (scrollbar hidden `:376`), `js/main.js:182–189`; no `scroll-snap-*` anywhere.
- **Native fix:** Add CSS scroll-snap + disable buttons at extremes:
  ```css
  .projects-carousel{ scroll-snap-type: x mandatory; }
  .project-card{ scroll-snap-align: start; }
  ```
  ```js
  function updateArrows(c){
    portfolioLeftBtn.disabled = c.scrollLeft <= 0;
    portfolioRightBtn.disabled = c.scrollLeft + c.clientWidth >= c.scrollWidth - 1;
  }
  ```
  Add a subtle gradient "more →" fade at the right edge as an affordance.
- **Severity:** Medium · **Effort:** S

#### 4.7.2 Hover-only affordances
- **Problem:** Lift/scale feedback (`.info-card:hover`, `.skills li:hover{scale 1.1}`, `.social-icons a:hover{scale 1.2}`) has no touch/focus equivalent; on touch devices these never trigger and on keyboard they're invisible.
- **Evidence:** `main.css:178–181, 239–243, 150–153`.
- **Native fix:** Mirror key hover states under `:focus-visible`; keep hover for pointer devices via `@media (hover:hover)`.
- **Severity:** Low · **Effort:** S

#### 4.7.3 AOS hides content if JS fails
- **Problem:** AOS sets `[data-aos]` to `opacity:0` until it animates them in; if the AOS CDN or JS fails, **27 elements (most of the page) stay invisible** — a progressive-enhancement hazard.
- **Evidence:** `index.html` `data-aos` ×27; `js/main.js:10–14`.
- **Native fix:** Treat motion as progressive enhancement so content is **never** hidden by default. Quick guard (trivial): set a `.js` class on `<html>` and scope the hidden state to it, so without JS everything stays visible. Better: drop AOS for native scroll-driven reveals that keep content painted if anything fails:
  ```js
  document.documentElement.classList.add('js'); // first line of body script
  ```
  ```css
  .js [data-aos]{ opacity:0; }              /* hidden only when JS is present */
  @supports (animation-timeline: view()){
    .reveal{ animation: fade-up linear both; animation-timeline: view(); animation-range: entry 0% entry 40%; }
  }
  ```
- **Severity:** **Critical** (verification upgraded this from Medium: 27 elements — About, Research, Work, Education, Skills, Projects, Portfolio, Profiles, Contact — go invisible if the AOS CDN/JS fails) · **Effort:** Quick guard T / full replacement M

#### 4.7.4 No active-section nav indication (scrollspy)
- **Problem:** On a long single page the nav never shows where you are.
- **Evidence:** nav `index.html:37–60`; no scrollspy in `js/main.js`.
- **Native fix:** IntersectionObserver toggling `aria-current="true"` + an underline on the active link (you already have the underline mechanic for `h3::after`).
- **Severity:** Medium · **Effort:** S

#### 4.7.5 Abrupt back-to-top toggle
- **Problem:** `backToTop` flips `display:block/none` (no fade); appears/disappears harshly.
- **Evidence:** `js/main.js:54`; `main.css:274–295`.
- **Native fix:** Toggle an `.is-visible` class with opacity/transform transition (and `visibility` for a11y), driven by the IntersectionObserver from 4.4.6.
- **Severity:** Low · **Effort:** T

---

## 5. What's Already Good (keep / build on)

- **Research badges with documented contrast.** `main.css:880–963` — publication-type pills + Accepted/Under-Review badges, each with an inline comment citing its WCAG ratio (e.g. "5.60:1 on the green fill"). This is exemplary; use it as the model for the rest of the palette.
- **Animated section underline.** `main.css:191–206` — the `h3::after` scale-in is a tasteful signature detail. Extend the same language to active-nav and links.
- **Token-based theming foundation.** CSS custom properties in `:root`/`[data-theme=dark]` (`main.css:10–36`) are the right base — the fix is to *lean harder* on tokens and stop fighting Bootstrap with `!important`.
- **Modular file split + readable JS.** `js/main.js` is organized into named `setup*` functions with comments.
- **Touch + smooth carousel** with passive listeners (`js/main.js:195–220`).
- **Current, substantive content** — 2026 résumé, three in-progress publications with venues, real GitHub links.

---

## 6. Native-Platform Opportunities (the "modern" thread)

Where the current build uses a JS/library approach, a 2026-native platform feature is cleaner:

| Today | Native replacement |
|---|---|
| AOS library (opacity:0 risk) | `animation-timeline: view()` scroll-driven animations + IntersectionObserver fallback |
| ~400-line `!important` dark mode | Bootstrap `data-bs-theme` + `color-mix()` token scale |
| JS injecting `<style>` + inline skill styles | Pure CSS `[data-theme=dark]` tokens (delete the JS) |
| Scroll listener for back-to-top | IntersectionObserver sentinel |
| Manual scrollspy (none today) | IntersectionObserver + `aria-current` |
| Bootstrap modals (fine) | Consider native `<dialog>` for the simpler ones |
| Full Font Awesome | Inline SVG sprite (~10 icons) |
| Fixed `px` type/heights | `clamp()`, `min()`, `aspect-ratio`, container queries |
| Carousel feel | CSS `scroll-snap` |
| Card hover-only | `@media (hover:hover)` + `:focus-visible`, `:has()` for stateful styling |

---

## 7. Suggested Section Order (IA)

A tighter narrative for a researcher-artist:

1. **Hero** — name, one-line value prop, location, CTAs (View CV · Research · Email) + theme toggle
2. **About** — keep, capped measure
3. **Research / Publications** — *expanded first item or teaser*; this is the headline credential
4. **Selected Projects** — single merged gallery (resolves §4.5.1 duplication)
5. **Experience** (Work) — accordion
6. **Education** — accordion
7. **Skills** — categorized
8. **Creative** — poetry / photography / textile as first-class visual content (new; see §8)
9. **Contact** — single consolidated block (absorbs Online Profiles)
10. Footer

---

## 8. Design North-Star

*(This section is enriched by the design-vision agent in §9.2; the version below is the baseline direction.)*

**Positioning:** "A researcher who codes like a scientist and composes like a poet." The site should feel **precise but warm** — editorial whitespace, one confident accent, a touch of craft in the details (underlines, snap, reveal), and real creative work on display rather than described.

**Token system (drop-in `:root`):**
```css
:root{
  /* Brand accent as a tonal scale via oklch */
  --accent:        oklch(0.70 0.17 55);    /* ~ #ff7f00 */
  --accent-strong: oklch(0.62 0.17 50);
  --accent-soft:   color-mix(in oklab, var(--accent) 14%, transparent);
  --ink:           oklch(0.27 0.02 260);   /* body text */
  --ink-muted:     oklch(0.52 0.02 260);
  --surface:       oklch(0.99 0.005 95);
  --surface-2:     oklch(0.97 0.008 95);
  /* Fluid type scale */
  --step--1: clamp(.83rem, .8rem + .15vw, .9rem);
  --step-0:  clamp(1rem, .96rem + .2vw, 1.08rem);
  --step-1:  clamp(1.2rem, 1.1rem + .5vw, 1.5rem);
  --step-2:  clamp(1.6rem, 1.4rem + 1vw, 2.2rem);
  --step-3:  clamp(2rem, 1.5rem + 2.5vw, 3.25rem);
  /* Space + shape */
  --space: clamp(1rem, .8rem + 1vw, 1.75rem);
  --radius: 14px;
  --shadow-1: 0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.05);
  --shadow-2: 0 8px 24px rgba(0,0,0,.10);
  --ring: 0 0 0 3px var(--accent-soft);
}
```

**Hero concept:** a left-aligned editorial hero — large fluid name (display face), a single value-prop line, a muted location/role line, two CTAs, and the social icons; optional restrained motion (a single reveal, reduced-motion-aware). Avoid the centered-everything template look.

**Signature details (≤5, tasteful):** (1) the existing animated underline extended to active-nav; (2) `scroll-snap` portfolio with edge-fade; (3) one scroll-driven reveal per section (native, reduced-motion-safe); (4) a "now / current focus" line in the hero that updates with research; (5) a small, real piece of the creative work (a single poem rendered typographically, or one photograph) embedded — proof, not a link.

**Creative integration without clutter:** one dedicated, visually-led "Creative" section (poetry typeset beautifully + a tight photo/textile strip) keeps the artist identity present without turning the research site into a scrapbook.

---

## 9. Multi-Agent Verification Addendum

This section is the output of an independent cross-check: **7 dimension auditors → 7 adversarial verifiers + 1 design-vision agent** (15 agents, ~1.5M tokens). Each verifier re-opened the cited files and computed/grepped the evidence itself, with a mandate to **reject or downgrade** weak findings. Result: **88 findings — 70 confirmed, 17 confirmed-with-adjustment, 1 rejected.** The authoring pass (§1–§8 above) and this verification pass were deliberately run as separate lanes; the items below are what verification *added* or *changed*, so §1–§8 + §9 together are complete without restating the overlap.

### 9.1 Corrections verification made to this document
- **AOS risk upgraded Medium → Critical** (now reflected in §4.7.3): with no `<noscript>`/`.js` guard, 27 `data-aos` elements stay `opacity:0` if the AOS CDN fails — most of the page disappears.
- **Contrast quantified** (now in §4.2.7–4.2.8): tagline = **4.45:1** (fails), white-on-orange = **2.53:1** (fails text *and* UI), dark active accordion `#0d6efd` on `#252525` = **3.41:1** (fails). All were "borderline/verify" before; now computed with AA-passing replacements.
- **One finding REJECTED (honest negative):** a claimed "two different email addresses" defect — `index.html:83` and `:767` are byte-identical `alexy1204@yahoo.com`. No defect; dropped.
- **A precision fix:** the touch-target guidance — WCAG 2.2 SC 2.5.8 (AA) minimum is **24×24px**, not 44px (44px is comfort/AAA). Only the bare theme-toggle hit area (~19px) is an actual AA concern; the small-screen carousel/back-to-top buttons pass AA.
- **A measurement caveat:** exact Font Awesome byte figures (~250–290 KB) are an external estimate — the woff2 files are CDN-hosted, not in-repo — but "full FA for ~16–17 unique glyphs" is confirmed.

### 9.2 Net-new priority items (slot into the §3 roadmap)
These were surfaced/sharpened by verification and are **not** already rows in §3:

| Pri | Item | Sev / Effort | Location | Native fix |
|---|---|---|---|---|
| **P0** | White-on-orange text/UI = 2.53:1 | High / S | `main.css:279,388,638` | `--primary-strong` via `color-mix(... 70%, black)` (§4.2.8) |
| **P0** | No-JS guard so AOS can't blank the page | Critical / T | `index.html:851` | `.js` class gates `[data-aos]{opacity:0}` (§4.7.3) |
| **P0** | Add `<main>` landmark + skip link; hero `<section>`→`<header>` | Medium / T–S | `index.html:78,80` | native landmarks + `.visually-hidden-focusable` skip link |
| **P0** | `<a href="#">` report triggers → `<button>` | Low / T | `index.html:552,613` | real `<button data-bs-toggle="modal">` (removes scroll-to-top) |
| **P0** | Drift bugs: 4 external links missing `rel`; `onerror` text mismatch | Low / T | `index.html:684,699,731,738`; `576` | add `rel="noopener noreferrer"`; fix "Sentiment+Classification" vs "Movie+Review" |
| **P0** | Accordion active color = Bootstrap blue `#0d6efd` on an orange site | High / S | `main.css:688,759,821,826` | `--bs-accordion-active-color: var(--primary-color)` |
| **P1** | All accordions collapsed by default — proof hidden | High / M | 19 panels | expand flagship items / native `<details open>` |
| **P1** | Surface a "Selected Publications" strip near the hero | Medium / M | `index.html:80–179` | reuse `.research-badge` pills in an always-open list |
| **P1** | Section reorder: Research/Projects before Work | Medium / M | section sequence | pure HTML move (sections are siblings) |
| **P1** | Carousel arrows overlap cards on phones (35px btn in 25px gutter) | Medium / S | `main.css:596,592` | hide arrows under `@media (pointer:coarse)`; swipe takes over |
| **P1** | No keyboard arrow nav for carousel | High / S | `js/main.js:162–220` | focusable `role="region"` + `keydown` Arrow handler |
| **P2** | Fixed-navbar offset = 3 desynced magic numbers (80/70/60 + 100) | Medium / M | `main.css:54,188,550,575` | `position:sticky` *or* one `--nav-h` + `scroll-padding-top` |
| **P2** | Unify anchors: `#about` vs `#about-header` dual-ID | Low / S | `index.html:38–59,98–99` | point nav at section ids + `html{scroll-padding-top}`; delete `-header` ids |
| **P2** | `prefers-color-scheme` default (OS-dark users get white) | Medium / S | `js/main.js:82` | `light-dark()` / anti-FOUC head script (ties to §4.4.2) |
| **P2** | `defer` scripts + `preconnect` for retained CDNs | Medium / S | `index.html:849–853` | `defer`; lazy-load `marked` on first modal open |
| **P2** | README "phantom features" (reduced-motion, categorized skills, ARIA toggle) | Medium / S | `README.md:126,137,177` | implement the features (preferred) or delete the claims |
| **P3** | `back-to-top` uses non-animatable `display` toggle | Medium / S | `js/main.js:54` | class + `opacity/visibility` transition (or scroll-driven) |
| **P3** | Hover-only affordances (no touch/`:active`) | Medium / S | `main.css:150,178,239,437` | wrap in `@media (hover:hover)` + add `:active` |
| **P3** | Decorative `<i>` icons lack `aria-hidden`; iframes lack `title` | Low / T | `index.html:64,84,88,91,806,826` | `aria-hidden="true"`; descriptive `title` |
| **P3** | `#cvIcon` tooltip never initialized (wrong `data-bs-toggle`) | Low / T | `index.html:63`; `js/main.js:17` | CSS `[data-hint]` tooltip or remove orphan markup |
| **P3** | GitHub icon `#333` invisible on dark bg (inline color) | Low / S | `index.html:722` | move to class + `color-mix(... 70%, white)` in dark |
| **P3** | `redundant-resume-section` duplicates navbar CV affordances | Low / S | `index.html:750–760` | remove; CV becomes hero CTA + footer link |

### 9.3 Per-dimension verdict counts
| Dimension | Findings | Confirmed | Adjusted | Rejected |
|---|---|---|---|---|
| Visual design | 6 | 2 | 4 | 0 |
| Accessibility | 16 | 9 | 7 | 0 |
| Responsive / mobile | 14 | 9 | 5 | 0 |
| Performance / infra | 6 | 3 | 3 | 0 |
| Information architecture | 17 | 12 | 4 | 1 |
| Semantics / code quality | 14 | 11 | 3 | 0 |
| Interaction / motion | 15 | 14 | 1 | 0 |
| **Total** | **88** | **60** | **27** | **1** |

### 9.4 Design north-star (expanded) — "The Measured Imagination"

> The vision agent's positioning, complementary to the conservative token set in §8. Where §8 uses sRGB `color-mix()` for maximum browser compatibility, this proposes a cutting-edge `oklch()` + `light-dark()` system — pick per your browser-support floor.

**Positioning.** A personal monograph for someone who *proves theorems and writes poems* — rigor and lyricism in conversation. Today the site is eight identical white `.info-card`s in flat "safety-cone" orange; the target is an editorial, archive-quality portfolio that **leads with academic weight** (the ACM C&C 2026 / ISMIR 2026 papers, currently buried as the second accordion) and treats creative practice (poetry since 2016, photography, textile) as a **counter-melody**, not a row of `dummyimage.com` placeholders. Palette: *warm paper + ink in light, deep warm-charcoal in dark; amber→terracotta accent with a cool indigo for "rigor"; generous whitespace; a display serif against a clean grotesque; restrained scroll-driven motion.*

**Tokens (one definition, both modes via `light-dark()`):**
```css
:root{
  color-scheme: light dark;
  --accent-500: oklch(0.68 0.17 52);   /* terracotta — primary */
  --accent-600: oklch(0.62 0.17 48);   /* hover */
  --indigo-500: oklch(0.55 0.13 264);  /* research voice */
  --bg:        light-dark(oklch(0.99 0.008 80), oklch(0.17 0.012 60));
  --surface:   light-dark(oklch(1 0 0),         oklch(0.21 0.012 60));
  --border:    light-dark(oklch(0.90 0.01 80),  oklch(0.32 0.012 60));
  --text:      light-dark(oklch(0.27 0.015 60), oklch(0.92 0.008 80));
  --text-muted:light-dark(oklch(0.50 0.02 60),  oklch(0.70 0.01 70));
  --accent:    light-dark(var(--accent-500), oklch(0.74 0.15 58));
  --accent-wash: color-mix(in oklch, var(--accent) 12%, transparent);
  /* fluid type */
  --font-display:"Fraunces",Georgia,serif; --font-body:"Inter",system-ui,sans-serif;
  --step-0: clamp(1.00rem,0.93rem + 0.30vw,1.18rem);
  --step-2: clamp(1.56rem,1.35rem + 0.95vw,2.25rem);
  --step-4: clamp(2.44rem,1.85rem + 2.70vw,4.40rem);
}
h1{ font:700 var(--step-4)/1.05 var(--font-display); letter-spacing:-.02em; }
```
This single block replaces the 11-var `:root` *and* the `[data-theme="dark"]` `!important` war, and deletes all three `h1` font-size media queries.

**Hero — editorial split:** eyebrow (`MRes Creative Computing · UAL · London, UK`) → serif headline leading with the duality (*"I build AI systems with the rigor of mathematics and the intuition of poetry"*) → ~60ch sub-deck from About → real CTAs (`View Research`, `Download CV`, secondary `Read poems`) → an `--accent-wash` status pill (*"ACM C&C 2026 · accepted"*) → a signature photo/ink backdrop instead of the social icons.

**Five signature details:** (1) scroll-driven ink underline via `animation-timeline: view()` (no JS); (2) a quiet full-bleed **poetry plaque** with one real couplet; (3) cursor-tracking accent glow on cards (`radial-gradient(at var(--mx) var(--my), …)`, unbound under reduced-motion); (4) `@view-transition` modal morphs (card expands into the report); (5) an OS-aware dark toggle defaulting to `prefers-color-scheme` + `accent-color: var(--accent)`.

**Three-act IA mirroring the tagline:** *(I) Research & AI* (cool indigo) → *(II) Selected Work* → *(III) Studio: Poetry · Photography · Textile* (warm serif + accent), so the rigor→imagination shift is **felt, not labeled**. Promote Research above Work; replace the placeholder carousel with a real curated grid on `:has()` + native `scroll-snap`; and make **"Personalized Poem Generation"** (a model fine-tuned on her *own* 100 poems) the Studio's hero case study — a generated poem beside a human-written one — because that is exactly where the two halves fuse.

**Free wins from this direction:** deletes the JS dark-mode `<style>`/inline hack; retires AOS and most Bootstrap accordion/modal JS in favor of native `<details>`/`<dialog>`/scroll-snap/view-transitions; and fixes both the OS-dark flash-of-white and the `white-space:nowrap` name-overflow.

---

## Appendix A — Project / Portfolio duplication map

| Project Experience (accordion) | Portfolio (carousel) | Notes |
|---|---|---|
| Personalized Poem Generation w/ Fine-Tuned LLM (`:427`) | Personalized Poem Generation (`:548`) | dup |
| Anomaly Detection & Forecasting in Power Systems (`:445`) | Anomaly detection / "Grid Frequency" (`:594`) | dup, title differs |
| EV Charging Stations – Dundee (`:463`) | EV Charging Optimization (`:564`) | dup |
| Sentiment Classification on Movie Reviews (`:481`) | Sentiment Classification (`:579`) | dup; **card adds 87.06% RoBERTa metric not in accordion** |
| 3D Object Generation from Text (`:499`) | 3D Object Generation from Text (`:652`) | dup |
| YOLOv9 Rock Detection (`:517`) | YOLOv9 Rock Detection (`:609`) | dup |
| — | Incomplete Data Analysis (`:624`) | portfolio-only |
| — | Statistical Methods for Incomplete Data (`:638`) | portfolio-only |
| — | Stable Diffusion Implementation (`:666`) | portfolio-only |
| — | Textile Design Portfolio (`:680`) | portfolio-only |
| — | Content Creation Portfolio (`:695`) | portfolio-only |

## Appendix B — External resource inventory

| Resource | Line | Type | Note |
|---|---|---|---|
| Bootstrap 5.3.0 CSS | `8` | render-blocking | jsdelivr |
| Font Awesome 6.4.0 **full** | `10` | render-blocking | ~10 icons used → subset/inline |
| Google Fonts Roboto | `12` | render-blocking | self-host candidate |
| AOS CSS | `14` | render-blocking | replace w/ native |
| **marked (unpinned)** | `20` | script | pin + load-on-demand |
| Bootstrap 5.3.0 bundle JS | `849` | script | `defer` |
| AOS JS | `851` | script | replace w/ native |
| dummyimage.com ×11 | `545–692` | images | replace w/ real/CSS art |
| wixsite iframes | `683,698,730,737` | embeds | X-Frame-Options risk |
| YouTube embed | `790` | iframe | inside **orphaned** modal |

## Appendix C — Inline-style locations (24)

`index.html` lines: 191, 211, 230, 249, 267, 285, 304, 331, 347, 363, 428, 446, 464, 482, 500, 518 (exp-date spans) · 716, 722, 728, 735, 742 (profile icon colors) · 806, 826, 841 (iframe/img sizing).

## Appendix D — Nav anchor integrity

All 8 nav links (`#about-header … #contact-header`) resolve to existing `id`s on the section `<h3>`s; `scroll-margin-top:100px` (`main.css:188`) offsets the fixed navbar correctly. `#resume-header` exists but is not in the nav; the "Online Profiles" `<h3>` (`index.html:712`) has no `id` and no nav entry (minor).

---

*Prepared as a read-only audit. Implementation of any item above is a separate, explicit step.*
