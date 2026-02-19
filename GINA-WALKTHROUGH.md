# BG Clear Rev 2 — Walkthrough for Gina (Feb 20 Zoom)

## What Changed (Summary)
This is a major visual overhaul while keeping all the content and functionality intact.

### 🎨 Brand Refresh
- **Color system**: Teal accent completely replaced with **gold (#d4a234)** throughout
- Navy (#1e3a5f) remains the primary brand color
- Gold adds warmth and premium feel — matches medical/healthcare positioning

### 🏠 New Hero Section
- Centered headline + subheadline (clean, confident)
- **Scrolling DME product marquee** — two rows of product tiles moving in opposite directions
- Subtle gold hexagonal wireframe grid in background
- Professional, modern, immediately communicates "we sell medical equipment"

### 📦 Product Pages (NEW)
- Every product now has its own dedicated page at `/products/[category]/[product]`
- Includes: description, key features, specifications, related products
- Breadcrumb navigation (Home → Category → Product)
- Category landing pages with clickable product cards
- **Shared data layer** — easy to add/edit products in one place

### 🏗️ Layout Changes
- **"Why BG Clear"** — bento grid section (replaces old layout)
- **"Who We Serve"** — clean navy pill chips (replaced dated icon grid), moved below bento
- **Process flow** — regenerated in gold (was teal)
- Overall spacing and typography improvements

### 📝 Blog/Resources (NEW — deploying today)
- Markdown-based blog at `/blog`
- For SEO content, product guides, industry news
- AI-generated content, easy to scale
- "Resources" link added to navigation

## Demo Flow (suggested order)
1. **Homepage** — scroll through hero, marquee, bento grid, Who We Serve, process flow
2. **Products** — click into a category → click into a specific product → show breadcrumbs
3. **Blog** — show the resources section (new)
4. **Mobile** — pull up on phone to show responsive design

## Needs Gina's Feedback On
- [ ] **Product descriptions** — are they accurate? Any corrections?
- [ ] **Product photos** — currently AI-generated. Does she want to supply real photos?
- [ ] **"Who We Serve" list** — are all provider types listed? Any to add/remove?
- [ ] **Hero headline/subhead** — does the messaging feel right?
- [ ] **FAQ section** — what questions do customers commonly ask? (still need to build this)
- [ ] **Contact form** — what fields does she need? What should happen on submission?
- [ ] **Blog topics** — what content would be useful? (equipment guides, insurance info, compliance tips)
- [ ] **Any pages missing?** (About Us expansion, Careers, Insurance/Billing info?)

### 🔍 SEO & Search Optimization (NEW — deployed today)
- **Meta tags**: Every page now has proper title, description, Open Graph, and Twitter cards — links shared on social media will show rich previews
- **Structured data (JSON-LD)**: Organization schema (Google Knowledge Panel eligible), Product schema on product pages, Article schema on blog posts
- **Sitemap**: Auto-generated sitemap.xml covering all pages, products, and blog posts — submitted to search engines
- **robots.txt**: Properly configured for crawler access
- **Image alt text**: All images have descriptive alt text for accessibility and image search
- **Heading hierarchy**: Clean H1 → H2 → H3 structure for search engine content understanding
- **LLM/AI Search ready**: Structured data helps BG Clear appear in AI-powered search results (Google AI Overviews, Bing Chat, etc.)

## Still To Do (after feedback)
- FAQ section
- Contact form refinement
- Mobile polish pass
- Real product photos (if provided)
- SEO meta tags + Open Graph images
- Blog content population
