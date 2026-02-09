# BG Clear — Inspiration Notes (Integrated Biosciences)

Reference site: https://integratedbiosciences.com

What to borrow (style, not content):

## Typography
- Big, confident H1
- Tight subhead
- Minimal copy blocks; short paragraphs

## Spacing & layout
- Generous section padding
- Clean max-width grid
- Low visual noise; whitespace does the work

## Animation / motion
- Subtle fade + translate on scroll
- No bouncy easing
- Keep interactions calm and “clinical modern”

## Signature pattern
- Sticky section intro + 01/02/03 capability blocks revealed on scroll

Implementation (SvelteKit)
- Use IntersectionObserver for reveal
- Use `position: sticky` for left column (desktop)
- Respect `prefers-reduced-motion`
