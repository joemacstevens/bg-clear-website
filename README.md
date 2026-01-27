# BG Clear Website

SvelteKit marketing site for BG Clear.

## Design tokens

Global tokens live in `src/app.css` and include:

- Colors: `--color-ink`, `--color-primary`, `--color-accent`, `--color-bg`, `--color-surface`
- Typography: `--font-heading`, `--font-body`, `--text-h1`, `--text-h2`, `--text-h3`
- Spacing: `--space-1` through `--space-8`, `--section-padding`
- Radii/shadow: `--radius-sm`, `--radius-md`, `--radius-pill`, `--shadow-sm`

## Developing

Once you've installed dependencies with `npm install`, start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.
