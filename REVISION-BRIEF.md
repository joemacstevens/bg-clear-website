# BG Clear Website Revisions — Gina's Feedback

You are working on the BG Clear medical supply company website.
- **Repo:** /Users/joestevens/Projects/bg-clear-website
- **Tech:** SvelteKit + Vite, single page app
- **Main page:** src/routes/+page.svelte
- **Branch:** Create a new branch `feat/gina-march-revisions` from main

## IMPORTANT: Read the codebase first
Before making changes, read +page.svelte and +layout.svelte fully to understand the current section structure, component names, and CSS conventions.

## Changes Required (5 categories)

### 1. Functional Fixes
- **Contact anchor:** The "Contact Us" button scrolls slightly below the form, cutting off Name/Organization fields. Fix the scroll anchor so it shows the top of the form.
- **Email/phone in contact section:** Move email to top of contact section with an email icon. Email must be a mailto: link. Add a phone icon next to the phone number.
- **Partner logos:** Fix alignment, spacing, and consistent sizing of partner/manufacturer logos so they appear clean and balanced.

### 2. Layout / Section Reorder
Reorder sections to this flow:
1. Hero
2. What We Do
3. Who We Serve
4. Why BG Clear (moved UP, before Products)
5. Products & Partners
6. How We Work
7. Start Your DME Partnership (renamed from "Next Steps")
8. FAQ
9. Contact

Also:
- Adjust all section header margins to align consistently
- Rename "Next Steps" to "Start Your DME Partnership" and add tagline: "Fast onboarding · Dedicated support · Responsive service"
- Place "Start Your DME Partnership" immediately after "How We Work"

### 3. Updated "How We Work" Section
Replace step titles and copy:

Step 1: Consultation & Review
"We begin with a brief consultation to understand your workflow, product needs, and compliance requirements. Our team reviews your setup and determines the most efficient path to support your patients."

Step 2: Documentation & Setup
"We coordinate required documentation, onboarding, and account configuration to ensure a compliant and streamlined ordering process."

Step 3: Fulfillment & Shipping
"Orders are processed quickly through our distribution network, ensuring accurate fulfillment and timely delivery to providers or directly to patients."

Step 4: Ongoing Support
"Our team remains available to assist with order updates, operational questions, and continued support as your needs evolve."

### 4. Refined "What We Do" — 4-Column Grid
Below the intro text "BG Clear supports healthcare providers with efficient, compliant distribution of durable medical equipment from prescription intake to fulfillment and patient delivery."

Create a 4-column capability grid with icons and equal card widths:
- Column 1: **Prescription & Order Intake** — We coordinate with providers to review prescriptions and confirm equipment needs
- Column 2: **Equipment Distribution** — Reliable sourcing and distribution of high-quality durable medical equipment
- Column 3: **Fulfillment & Delivery** — Fast, accurate order processing and delivery to providers or patients
- Column 4: **Operational Support** — Ongoing support for documentation and coordination

Cards should stack on mobile. Use relevant medical/logistics icons (SVG inline or heroicons-style).

### 5. Refined "Why BG Clear" Copy
Replace existing differentiator content with:

**Reliable Distribution** — Fast, accurate DME fulfillment supported by disciplined logistics.
**Real Operational Support** — Dedicated specialists who answer the phone and resolve issues quickly.
**Regulatory Discipline** — Processes aligned with documentation and compliance standards.
**Technology-Enabled Efficiency** — Streamlined workflows from prescription intake to fulfillment.

## After making changes:
1. Commit all changes to the `feat/gina-march-revisions` branch
2. Run `npm run build` to verify no build errors
3. Write a journal entry at journal/2026-03-13.md documenting what was changed
