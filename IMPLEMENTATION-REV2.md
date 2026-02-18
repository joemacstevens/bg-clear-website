# BG Clear Website — Rev 2 Implementation Plan

> **Last updated:** Feb 17, 2026
> **Point of contact:** Gina Barthelemy (gina@egeba.net)
> **Next review:** Friday Feb 20, 1:00 PM EST (Zoom)
> **Repo:** `/Users/noahajeo/Documents/Repos/bg-clear-website/`
> **Live site:** bg-clear-website on Vercel
> **Inspiration:** https://avamedsupply.com (layout/structure only — NOT copying their visuals)

---

## Overview

Major redesign based on client feedback. Moving from illustration-heavy "legacy" feel to a modern abstract-geometric + real-photography hybrid. Think: AvaMed's structural approach but with BG Clear's own visual identity.

**Key principle:** AvaMed's *technique* (geometric shapes, circular photo masks, numbered sections, photo integration on scroll), BG Clear's *identity* (cross motif, navy/gold palette, swoosh curves).

**Visual flow:** Abstract/geometric/illustrated elements at TOP → real photos gradually integrated as you scroll DOWN. Keep the homepage clean and uncluttered — detail lives on sub-pages.

---

## Brand Colors (from logo)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-navy` | `#1e3a5f` | Primary — text, headings, geometric shapes |
| `--color-navy-dark` | `#0f2744` | Dark sections, footer, overlays |
| `--color-gold` | `#d4a234` | Accent — CTAs, swoosh curves, section dividers, hover states |
| `--color-gold-light` | `#f5e6c4` | Light gold tints, subtle backgrounds |
| `--color-teal` | `#0d9488` | Secondary accent (existing, use sparingly) |
| `--color-white` | `#ffffff` | Surfaces, cards |
| `--color-bg` | `#fafbfc` | Page background |
| `--color-text` | `#1e293b` | Body text |
| `--color-muted` | `#64748b` | Secondary text |

---

## Custom Geometric System (ORIGINAL — do not copy AvaMed)

Derive from the BG Clear logo cross + swoosh:

1. **Angular cross shapes** — abstracted from the medical cross in logo. Use as background elements, section accents.
2. **Swoosh curves** — gold arcs inspired by the logo swoosh. Use as section dividers, decorative elements.
3. **Angled section edges** — navy blocks with diagonal/angled cuts (not triangles like AvaMed).
4. **Overlapping translucent layers** — navy + gold at varying opacity for depth.
5. **Circular photo masks** — real photos in circular/rounded frames over geometric backgrounds.

**Implementation:** Build as SVG components or CSS clip-paths. NOT raster images. Must be scalable and lightweight.

### Agent Assignment: MiniMax
MiniMax previously created the illustrations the client liked. Use MiniMax to:
- Generate abstract geometric background compositions (navy/gold/white)
- Create hero section visual concepts
- Design section divider graphics
- Produce any abstract/artistic visual elements

---

## Page Structure (top to bottom)

### 1. HEADER / NAV
- **Logo** → upper LEFT (not centered)
- Bold nav links (like AvaMed): Home, About Us, Products, Blog, Contact Us
- **Upper right buttons:** Phone icon, Email icon, Location icon
- **CTA button:** "Contact Us" (NOT "Talk to a Specialist")

### 2. HERO SECTION
- **Tagline above:** "A Tech-Forward DME/HME Distribution & Wholesale Company"
- **BG Clear LLC** brand name prominent upper left, tagline on top of it
- **Abstract geometric background** (navy/gold — our original design)
- **Circular photo mask** with healthcare/professional image layered over geometry
- **Two CTAs:** "Contact a DME Specialist" + "View Product Categories"
- **Social links:** Facebook, LinkedIn, Instagram (left side, like AvaMed)
- **⚠️ NO real photos in hero** — keep abstract/geometric/illustrated feel up top
- **⚠️ NO scrolling photo carousel in hero** — the scanning/fulfillment images move down to "How We Work"

### 3. CAPABILITIES / VALUE GRID (replaces old "What We Do" + scroll-lock sections)

**⚠️ KEY DESIGN ELEMENT — this is the signature section.**

Full-width interactive bento grid mixing three tile types:
- **Claim tiles** — short bold statements (e.g., "PDAC Approved", "Fast Fulfillment", "Compliance Built-In", "Real People Who Answer The Phone")
- **Photo tiles** — real photos or abstract visuals (warehouse, products, team)
- **Color block tiles** — solid navy, gold, or gradient fills for rhythm

**Grid layout:** Irregular/masonry-style across the full section width. Mix of sizes (1x1, 2x1, 1x2). NOT a uniform grid — visual interest through variation.

**Interaction:** Hover/click on a **claim tile** → a full-width detail panel expands BELOW it (pushes content down, doesn't overlay). Panel contains:
- Expanded description of the claim
- Supporting photo or icon
- Possible CTA ("Learn More", "Contact Us")

Close on click-away or toggle. Smooth height animation.

**Mobile:** Tiles stack. Tap to expand detail panel (no hover).

**Inspiration:** AvaMed's service grid, but taken further with mixed content types and the expand-on-hover interaction.

**Agent note:** This is the hero differentiator of the redesign. Nail this and the rest is easy. MiniMax should concept the visual composition; Claude Code builds the interactive grid component.

### 4. WHO WE SERVE
- Short, punchy section
- Keep as-is — client said it's fine

### 5. PRODUCTS (moved UP — before How We Work)
- Category cards with existing imagery (healthcare monitoring, mobility, etc.)
- Each card gets a **"Learn More" button** → links to dedicated product category page
- **⚠️ NO carousel** — keep the grid/card layout, don't carousel on the homepage
- **Product category pages** (new, one per category):
  - Lists all products in that category (e.g., Health Monitoring → blood pressure monitors, glucometers, etc.)
  - Each product is clickable → goes to individual product detail page
- **Product detail pages** (new): product image, description, product ID, manufacturer, FDA approval status, Medicare eligibility
- Informational only — **NO e-commerce / no ordering**
- Keep front page clean and uncluttered — detail lives on sub-pages
- Use placeholder products until Evan sends the real list

### 6. WHY BG CLEAR (expanded "About Us")
- **This is where real photos go** — team, warehouse, operations
- Mission statement + differentiator copy (⚠️ WAITING ON CLIENT)
- Layout like AvaMed's About section — photos of real people + copy blocks
- Placeholder copy OK for now — flag clearly

### 7. TRUSTED MANUFACTURERS
- Keep as-is — client specifically praised this section ✅

### 8. HOW WE WORK
- Moved BELOW products
- **This is where the real photos live** — scanning boxes, fulfillment, distribution, support
- The scrollable photo sections (compliance, fast fulfillment, reliable distribution) that were in the hero **move here**
- New wording for the steps (reach out → confirm → deliver) coming from Gina (⚠️ WAITING ON CLIENT)
- Placeholder copy OK for now

### 9. BLOG SECTION
- Add blog grid (like AvaMed's)
- Initially can be placeholder articles
- Future: automated blog generation for SEO (separate task)

### 10. FOOTER
- Social media links (Facebook, LinkedIn, Instagram)
- Contact info, address
- Possible **returns section/page** (⚠️ Gina checking with Evan — TBD)

---

## Content Status

| Content | Status | Owner |
|---------|--------|-------|
| Product list | ⏳ Waiting | Evan |
| Mission / differentiator copy | ⏳ Waiting | Gina + Evan |
| "How We Work" new wording | ⏳ Waiting | Gina |
| Team/warehouse photos | ⏳ Waiting | Gina + Evan |
| Social media links | ⏳ Waiting | Gina |
| Existing section copy | ✅ Done | — |
| Product category images | ✅ Existing | — |
| Trusted manufacturer logos | ✅ Existing | — |

**Rule:** Use placeholder content where client copy isn't ready. Flag with `<!-- TODO: Client copy needed -->` in code.

---

## New Pages to Build

1. **Product category pages** (one per category: Health Monitoring, Mobility, etc.)
   - List products with: image, name, description, product ID, manufacturer, FDA approval, Medicare eligibility
   - Clean grid layout
   - Breadcrumb navigation back to main products section

2. **Blog page** (future — not for this iteration)

---

## Technical Notes

- **Stack:** SvelteKit + Vercel
- **CSS:** Custom properties (update `app.css` with new color tokens)
- **Geometric shapes:** SVG components or CSS clip-path — no raster backgrounds
- **Photos:** Optimize all images (WebP preferred, with PNG fallback)
- **Responsive:** Mobile-first. Test at 375px, 768px, 1024px, 1440px
- **Animations:** Subtle fade + translate on scroll (IntersectionObserver). Respect `prefers-reduced-motion`.

---

## Agent Workload Distribution

| Task | Recommended Agent | Priority |
|------|-------------------|----------|
| Geometric visual system (hero BG, section dividers, abstract elements) | **MiniMax** | P0 |
| Layout restructure (section order, nav, header) | **Claude Code** | P0 |
| Product category pages | **Claude Code** | P1 |
| Copy placeholders + CTA text changes | **Claude Code** or **Antigravity** | P0 |
| Blog section scaffold | **Claude Code** | P2 |
| Color token updates (`app.css`) | **Any agent** | P0 |
| Photo sourcing (stock placeholders) | **Noah (OpenClaw)** | P1 |
| SEO metadata updates | **Any agent** | P2 |

---

## CTA / Copy Changes (Quick Wins)

These can be done immediately:

- [ ] "Talk to a Specialist" → **"Contact Us"**
- [ ] "Talk to a DME Specialist" (hero) → **"Contact a DME Specialist"**
- [ ] Add social media icons to footer (placeholder links OK)
- [ ] Move logo to upper left
- [ ] Add phone/email/location buttons to upper right nav

---

## Milestone: Friday Feb 20 Zoom

**Must have for review:**
- [ ] New layout structure (section reorder)
- [ ] Updated nav (logo left, contact buttons right)
- [ ] CTA text changes
- [ ] Geometric hero concept (even if rough)
- [ ] Product section with "Learn More" buttons
- [ ] Placeholder "Why BG Clear" section

**Nice to have:**
- [ ] At least one product category page
- [ ] Blog section scaffold
- [ ] Stock photo placeholders in real-photo sections

---

## Content Generation (Future)

### Blog Engine
Auto-generate SEO blog articles for DME/HME topics. Potential approach:
- Google NotebookLM as content research source (CLI integration TBD)
- Generate articles on topics like: DME licensing, dropshipping medical supplies, PDAC compliance, state regulations
- Reference AvaMed's blog topics as a starting template
- Output: markdown → render on blog page

### Idea Bank
- NotebookLM CLI → blog content pipeline
- Automated SEO article generation for DME clients (could be a service offering)

---

## Reference Files

- Meeting notes: `/Users/noahajeo/.openclaw/workspace/memory/bg-clear-rev2-notes.md`
- Visual asset plan: `/Users/noahajeo/.openclaw/workspace/memory/bg-clear-visual-assets.md`
- Brand inspiration (prev): `/Users/noahajeo/Documents/Repos/bg-clear-website/NOTES_brand-inspiration.md`
- Logo: `/Users/noahajeo/Documents/Repos/bg-clear-website/src/lib/assets/bg-clear-logo.png`
- Inspiration site: https://avamedsupply.com
