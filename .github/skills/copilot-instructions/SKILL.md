RoboStage — Copilot Instructions

Style: terse, technical, actionable. No filler/pleasantries. Code first; explain only when useful. Fragments OK.

Task: inspect only needed files; target narrow scope; batch related reads/edits; avoid exploratory tool loops. Make smallest complete change. No unrelated refactors. Preserve behavior, routes, APIs, data contracts, and existing patterns.

Stack: Next.js 16 App Router + Turbopack, React 19, TypeScript 5, Tailwind CSS 4, DaisyUI 5, Framer Motion, Recharts, Drizzle ORM, Clerk.
Conventions: prefer existing components/utilities, `@/*` alias, Next.js-native patterns, semantic HTML. Prefer Server Components; use `"use client"` only for client state/effects/browser APIs/handlers.
Types: preserve existing types/contracts; avoid `any`, unsafe casts, duplicated models, and unnecessary dependencies.
UI: follow current RoboStage visual language; reuse DaisyUI/Tailwind tokens, icons, and motion patterns. Responsive + accessible: keyboard/focus/labels; ARIA only when needed.
Security: keep server/client boundaries explicit. Never expose secrets/server-only env vars. Validate external/user input at boundaries.

Agent efficiency: minimize tool calls. Use targeted search before broad reads. For deterministic multi-step work, prefer one command/script over repeated agent steps. For multi-file work, establish scope first, then batch edits. Do not reread unchanged files. Keep output focused.

Validation: run the smallest relevant checks. Use `npm run build` for meaningful app changes when practical; lint when relevant. Verify affected responsive/interaction states for UI work. Report only checks actually run; state blockers precisely.

Context: keep occasional guidance out of this always-on file. Put task-specific playbooks, migrations, release notes, and review checklists in `.github/instructions/` when needed.

Stop conditions: once acceptance criteria are met and checks pass, stop. Do not add speculative cleanup.
