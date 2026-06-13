# CLAUDE.md

All project conventions — architecture, the shared libraries to reuse, the CSS
design system, agent role briefs, and the **Agent Coordination & Deploy Rules**
— live in **[AGENTS.md](./AGENTS.md)**. Read it first.

The single most important rule (it has already caused a production regression):

> **Be on the latest `feature/ecommerce-quote-to-payment` → commit → `vite build`
> → `vercel deploy --prod`. Never deploy a stale/uncommitted working copy** —
> `vercel deploy --prod` ships your local working directory, so deploying from
> an old base silently reverts whatever else was shipped after that base.

@AGENTS.md
