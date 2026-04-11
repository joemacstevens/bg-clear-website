# BG Clear — Visual Style Guide for AI Image Generation

> **For:** MiniMax and any image-generating agent working on BG Clear assets
> **Brand:** BG Clear LLC — DME/HME distribution & wholesale company
> **Logo reference:** `src/lib/assets/bg-clear-logo.png`

---

## Brand Colors (STRICT — use these exact tones)

| Color | Hex | Role |
|-------|-----|------|
| Navy Blue | `#1e3a5f` | Primary — dominant color in compositions |
| Dark Navy | `#0f2744` | Deep backgrounds, overlays |
| Gold / Amber | `#d4a234` | Accent — swooshes, highlights, CTAs, energy |
| Light Gold | `#f5e6c4` | Soft tints, warm highlights |
| White | `#ffffff` | Clean space, text on dark |
| Light Gray | `#fafbfc` | Page background |
| Warm Gray | `#64748b` | Secondary text, subtle elements |

**Do NOT use:** Bright red, bright green, neon anything, pastels, earth tones. Keep it navy + gold + white. Clean and corporate but not cold.

---

## Visual DNA (derived from logo)

The BG Clear logo has two key shapes:
1. **Medical cross** — angular, bold, navy blue
2. **Gold swoosh** — a curved arc that wraps around the cross, suggests motion/flow/delivery

### Geometric Language
Build all abstract visuals from these primitives:
- **Angled blocks** — navy rectangles/parallelograms with diagonal cuts (NOT triangles)
- **Curved arcs/swooshes** — gold, suggesting movement and logistics flow
- **Cross fragments** — abstracted medical cross shapes as background accents
- **Circles** — for photo masks and accent dots
- **Overlapping translucent layers** — navy at 80% over gold at 40%, etc.

### What It Should Feel Like
- **Professional but not sterile** — this is healthcare logistics, not a hospital
- **Modern and tech-forward** — clean lines, geometric precision
- **Trustworthy** — navy conveys stability, gold conveys quality/premium
- **Movement/flow** — the swoosh = supply chain in motion (prescription → fulfillment → patient doorstep)

### What It Should NOT Feel Like
- Medical/clinical (no stethoscopes, no scrubs, no hospital beds)
- Generic corporate stock photo vibes
- Cluttered or busy
- Cold/sterile silicon valley tech
- Cheap/templated

---

## Asset Types Needed

### 1. Hero Background Composition
- Abstract geometric composition using navy blocks + gold swooshes
- Should have visual "weight" on one side to leave room for text on the other
- Include a circular cutout area where a photo can be masked in
- Wide format (16:9 or wider), at least 1920x800px
- Transparent or white background outside the geometric elements

### 2. Section Divider Elements
- Horizontal decorative elements to separate page sections
- Gold swoosh arcs or navy angular lines
- Subtle — should feel like elegant punctuation, not barriers
- Wide format, ~1920x100-200px

### 3. Bento Grid Accent Tiles
- Square and rectangular abstract compositions (various sizes)
- Some navy-dominant, some gold-dominant, some mixed
- These fill the "color block" slots in the capability grid
- Sizes needed: 400x400, 800x400, 400x800

### 4. Icon-Style Graphics (for capability claims)
- Abstract/geometric icons representing:
  - **Compliance / PDAC Approved** (shield + cross motif)
  - **Fast Fulfillment** (swoosh + arrow, speed/motion)
  - **Reliable Distribution** (connected nodes / network)
  - **Real People / Support** (warm, human-feeling abstract)
  - **Shipping / Logistics** (box + motion lines)
  - **Trusted Partners** (handshake or connected elements)
- Style: geometric line art in navy + gold, NOT flat illustration, NOT realistic
- Size: 200x200 or 400x400, transparent background

### 5. Product Category Headers
- Abstract backgrounds for product category pages
- Each slightly different but clearly from the same family
- Categories: Health Monitoring, Mobility, Safety, Specialized Support (may change)
- Size: 1920x400, with space for text overlay

### 6. About/Team Section Background
- Warm, professional abstract background
- Navy + gold + warm lighting feel
- Space for real team photos to be composited on top
- Should feel human/approachable, not corporate cold

---

## Photography (AI-Generated)

We are generating ALL photos — no stock photography. MiniMax should produce photorealistic images for:

### Shots Needed
| Shot | Description | Size | Section |
|------|-------------|------|---------|
| **Warehouse/fulfillment** | Clean, organized modern warehouse with DME boxes being packed/shipped. Warm lighting. | 1200x800 | How We Work, Bento Grid |
| **Professional on phone** | Person in business casual at a clean desk, headset on, warm and approachable. NOT a call center vibe. | 800x800 (circular crop) | Hero, Support claim |
| **Shipping/logistics** | Delivery truck or packages in motion, professional, branded feel | 1200x800 | How We Work |
| **Medical equipment close-up** | Clean product shots of DME items (braces, monitors, mobility equipment) on white/neutral background | 800x800 | Product sections |
| **Team/office** | 2-3 professionals in a modern office or conference room, collaborative, diverse | 1200x800 | Why BG Clear |
| **Compliance/quality** | Someone inspecting products or reviewing documents, quality control feel | 800x800 | Bento Grid |
| **Handoff/delivery** | DME product being received by a healthcare provider or patient (tasteful, not clinical) | 1200x800 | How We Work |

### Photo Style Rules
- **Warm color grading** — slight gold/amber warmth matching brand, NOT cool/blue
- **Clean, modern settings** — everything looks organized and professional
- **Diverse people** — professional attire, NOT scrubs or lab coats
- **Shallow depth of field** where appropriate
- **Lighting:** Natural or warm studio. No harsh fluorescents.
- **NO:** Stock photo smiles, handshakes, pointing at screens, stethoscopes, hospital beds, clinical sterile vibes

---

## Composition Rules

1. **Asymmetry over symmetry** — off-center compositions feel more dynamic
2. **Breathing room** — generous white/negative space. Don't fill every pixel.
3. **Layer depth** — use overlapping translucent shapes to create depth
4. **Consistent weight** — navy is the heavy/grounding color, gold is the energy/accent
5. **Ratio:** ~60% navy, ~25% white space, ~15% gold in any composition

---

## File Format Requirements

- **Backgrounds/compositions:** PNG with transparency where possible, or JPG at quality 90+
- **Icons:** SVG preferred, PNG with transparency as fallback
- **Resolution:** Minimum 2x for retina (e.g., 1920px wide hero = generate at 3840px)
- **Color space:** sRGB

---

## Examples of What We're Going For

Think along these lines (but in navy + gold):
- Apple's geometric product page backgrounds
- Stripe's angled gradient sections
- Linear.app's clean dark geometric aesthetic
- NOT: generic medical website templates, NOT AvaMed's exact red triangles

---

*This guide should be loaded by any agent generating visual assets for BG Clear. All output should be reviewed by Joey before going live.*
