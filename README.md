# Referral

Referral is a configurable, evidence-led career intelligence workspace. This first vertical slice focuses on the core decision loop: career profile and goals → manual opportunity capture → transparent fit breakdown → next action.

## Run locally

Requires Node.js 20.9 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The app starts in a local demo mode with login disabled and synthetic example data. Switching the active industry loads an isolated synthetic workspace for that context; changes stay in this browser's local storage. Avoid entering sensitive career information: there is no account, server-side data store, or production login yet.

## Current functionality

- Four isolated synthetic workspaces: Technology, Finance, Healthcare, and Public Sector.
- A synthetic Free plan workspace with profile, goals, evidence, sample opportunities, and contacts.
- Manual opportunity, evidence, and contact capture; local persistence; status pipeline; and source URL registry.
- Deterministic opportunity scores with fit breakdown, matches, evidence gaps, and confidence labels.
- Free/Paid plan preview with configurable demo limits; payment collection and real billing are not connected.
- Responsive layouts reviewed at compact phone widths, including full-screen opportunity details and forms.
- Login is off for local use. The auth configuration seam is present, but a Supabase login flow is not implemented.
- Production builds are deliberately blocked until real authentication and server-side data authorization are implemented.

The example people, companies, job listings, compensation ranges, and evidence are synthetic. No external job or research sources are connected and no live openings are represented.

## Useful commands

```bash
pnpm typecheck
pnpm build
```

`pnpm build` currently exits with a guard explaining that auth and server-side authorization must be implemented before production output is enabled.
