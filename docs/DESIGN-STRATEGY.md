<!-- Forward-looking design strategy. 2026-06-08. Produced by a 29-agent first-principles
     ideation (4 audience lenses -> 6 design minds -> adversarial slop-sentinel -> judge); all 6
     minds independently converged on the poem diptych as the core move. Companion to SITE-KNOWLEDGE.md
     (the backward map). Taste rule: proof over claim, felt not labeled, subtraction over addition. -->

# Strategy: The Monograph That Proves Both Halves

## 1. The mental model

This site is a **researcher's monograph, not a portfolio** — a single linear argument that one person holds rigor and craft as the same instinct. The deslop won the *form* war (clean, numbered, subtracted); the unfinished war is *evidentiary*: the Research half **proves** itself (named venues, RoBERTa 87.06%, repo links, accepted/under-review badges) while the Craft half only **claims** ("Poet & Photographer" asserted ~8 times, shown zero times). The single decision rule: **does this turn a claim into a shown artifact, or just restate a claim more loudly?** Show, don't assert; let the dual-accent and section numbers *feel* the duality rather than label it; when in doubt, **subtract** — selectivity is the most authored signal a researcher can send. The owner never rejected the *facts* (her "2016 first poem" lives as prose); she rejected facts being **promoted into decorative modules** (bands, rotators, counters, slogans). Every move below shows real material inside an existing container, or removes an unbacked claim. Nothing new is a module.

## 2. The core essential move — the poem diptych

**Make the buried poem-generator project *demonstrate itself* — her real seed poem beside her model's real generation — inline in the existing accordion.** All five lenses converged here independently. It is the only artifact where "Researcher" and "Poet" are *literally one object*: her 100 self-written poems **are** the training set, her LoRA/MLX fine-tune **is** the method. No applicant can copy "I taught a language model to write in my own voice — read both sides." Earns via **distinctive-true identity** *and* **credibility**; it is the inverse of every deslop deletion — those promoted a fact into chrome, this removes an assertion and shows the work. Zero fabrication — both texts sit verbatim in her public tech-doc (verified in `assets/projects/poem_generator_project_TECHNICAL_DETAILS.md`).

**Build (verified):**
- **Where:** inside the existing `Personalized Poem Generation` accordion body, `index.html` line 611, **above** the two `<li>` bullets (which stay as the method line). Accordion body, **not** the carousel card — preserves gallery cover rhythm; degrades natively with JS off / `prefers-reduced-motion`.
- **What:** one `<figure class="poem-diptych">` with two `<blockquote>`s. **Left** "Her poem" → `阳光洗去了树叶的所有颜色，/ 它们的色彩溅在我的脚上，/ 蒸发成蝴蝶，/ 然后飞走了。` + her English translation muted beneath. **Right** "A generation from her fine-tuned model · theme 「阳光」" → `清晨的阳光 / 它弯曲伸展在清冽的河水 …` + translation. Wrap Chinese in `lang="zh"`.
- **Style:** ~25 lines CSS reusing tokens — `var(--font-display)` (Fraunces italic) for verse, `--secondary-color` for the gloss, the `.about-prose` grid collapsing to one column at the existing ≤576px breakpoint (`style/main.css` line 1215). **Neutral hairline divider, NOT `--research-accent`** — keep indigo scoped to Research; let Fraunces italic carry craft.
- **Caption:** none, or one plain factual line. No "where Researcher meets Poet" thesis — one slip from the rejected "math meets art" slogan.
- **Keep** the View Project + View Report buttons. Model name: **Qwen 2.5 7B** (as in her doc), not bare "Qwen-7B".

**Needs from her (one gate):** explicit "yes" to surface *these two pieces* publicly. Already in her committed repo/HF card — a sign-off, not new material. Label the right column as **a** generation (curated sample), never "the" deterministic output.

## 3. Supporting touches (ranked, kept small)

**(A) Subtract the carousel tail: 13 → 10 cards. (subtraction / credibility)**
Delete the three thin/duplicate cards — `Incomplete Data Analysis` (837-849) and its near-duplicate `Statistical Methods for Incomplete Data` (851-863), plus the generic `Stable Diffusion Implementation` (879-891). *Why:* every lens named these scaffolding; 10 cards she stands behind beat 14 behind placeholder SVGs. *Build:* delete three `.project-card` blocks — no CSS/JS change (carousel/filter JS in `js/main.js` is count-agnostic). *Clutter:* negative. *Needs her:* nothing. **Do NOT execute the killed "de-double Dreamfusion" step** — Dreamfusion (866) and SD (880) are distinct, not duplicates. No filter chip strands (Data&OR via EV Charging; Generative via Dreamfusion).

**(B) Resolve the two Wix "creative" tiles honestly — her call, default cut. (credibility)**
`Content Creation Portfolio` (909-921) and `Textile Design Portfolio` (893-906) lean on the same hollow "a collection of creative writing, photography…" copy and bounce to Wix — they *describe* a gallery instead of *being* one, the assert-don't-demonstrate failure doubled. *Build:* delete both `.project-card` blocks (`creative` chip survives via the poem card). **Do NOT mint a "Creative Practice" card** — a new label that still says "photography" re-asserts what the page can't show. *Clutter:* none. *Needs her:* is the Wix site still current/representative? If yes, keep **one** honest outbound link with the hollow description stripped; if no, cut both.

**(C) Give the accepted C&C poster a citable spine — only when she supplies the inputs. (credibility)**
On the **first** Research item only, add inside the existing `.accordion-body` (after the venue line at 256): one muted citation line with her **confirmed** author string + one `.btn-sm.btn-outline-secondary` "Read poster (PDF)" link. *Why:* the academic lens called this "the single change that outweighs everything else" — "Accepted" with nothing behind it reads as aspiration. *Build:* ~4 lines reusing `.research-venue`; indigo scopes automatically. *Clutter:* tiny. **Gate the WHOLE change on two real inputs** — do NOT ship a lone `Yu, H.` line now: it only echoes the venue + Poster badge on screen, and guessing sole-authorship on a poster that plausibly has a co-author is the unverified claim a supervisor flags. *Needs her:* exact author/co-author string **and** one public link (arXiv / OpenReview / DOI / PDF in `/assets`). **Never ship a dead `href="#"`** — a placeholder citation link reads as faked provenance.

## 4. What to explicitly NOT do

- **No Cite/BibTeX block on Research items** (killed twice). Claim→record needs a *resolvable link*, not a copyable blob; an MRes with one poster has no audience citing her *from her homepage*.
- **No "Preprint coming" / "available on request" placeholders.** Three "coming soon" non-links turn honest space into visible vaporware — its own AI tell. The clean empty state is better.
- **No author line that merely reprints the venue.** Formal-register filler.
- **No "Creative Practice" relabel card.** Still asserts photography the site can't show.
- **No new dated band, stats strip, ethos band, role rotator, counter, or slogan** — she built and deleted every one. Keep "2016 first poem" as About prose; never print "2016 corpus" on the 2020 poem (wrong date, contradicts About).
- **No promoting the diptych onto a carousel card face**, no first/third-person marketing CTA — breaks gallery rhythm, drifts into AI register. One surface: the accordion body.
- **No touching the hero aurora/grid, resilience layer, section kickers, or scoped indigo** — the audit named these the strongest parts.

## 5. Optional subtraction

**The footer + Skills "photographer" labels.** Asserted across ~8 surfaces, shown nowhere; no real photos in the repo. The honest, more-credible move is to quiet the *visible chrome* — footer line 1002 (`poet & photographer.` → `poet.`) and Skills line 545 (`Writing & Photography` → `Writing`) — while **leaving the hero role line, About prose, and the invisible meta/OG/schema keywords untouched** (SEO terms carry no "shown-zero" burden; editing them is over-correction). Her decision, not a silent edit — it trims a word she identifies with. **Preferred alternative:** she supplies real photographs and we keep the word everywhere. Everything else has earned its place; resist cutting further.

## 6. What only she can provide (the short ask)

1. **One "yes" to publish the poem pair** (2020 seed poem + Qwen 2.5 7B "阳光" generation). Already public in her repo/HF card — unlocks the single highest-value move (§2). Without it, nothing closes the deepest gap.
2. **The accepted C&C 2026 poster: (a) exact author/co-author string, (b) one public link** — arXiv, OpenReview, DOI, or a PDF for `/assets`. Unlocks §3C. Don't guess authorship.
3. **2–4 real photographs** — if "Photographer" is to stay an asserted capability. None exist in the repo (`veritas.jpg` / `hidden-connection.jpg` are tech covers). Either she supplies images and we build one small honest photo proof, **or** we soften the word in the two visible chrome surfaces until she does (§5).
4. **Is the Wix site still current?** A yes/no deciding whether one creative outbound link survives or both are cut (§3B).

**Bottom line:** ship the poem diptych (gated on ask #1) and the three-card subtraction (no gate) now — together they convert the weakest claim into the strongest proof and make every surviving card self-proving. Hold the C&C citation and the photography decision for her assets. Do nothing additive beyond these. The page stays the clean, subtracted monograph it already is — it just finally *shows* the poet it has only been naming.
