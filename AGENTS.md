# AGENTS.md

## Scope

These instructions apply to the entire repository.

## Development workflow

- Work from a GitHub Issue with one clear objective.
- Create a branch from `main`; do not commit directly to `main`.
- Keep pull requests small, focused, and linked to their Issue.
- Run lint, tests, and build before requesting review.
- Do not implement unrelated roadmap items.

## Architecture boundaries

Maintain this dependency direction:

`UI -> Game/Application -> Terminal/Battle/Scenario -> Network Simulator -> Scenario Data`

Keep game flow, scenario engine, terminal parser, command executor, network simulator, investigation history, battle engine, scoring, progression, learning review, and storage separate. React components must not contain network-fault decisions, EXP calculations, or persistence details.

## Security invariants

- Terminal input must flow only through `Command Parser -> Command Executor -> Network Simulator`.
- Never use `eval`, `new Function`, `child_process`, shell execution, real ping/DNS, or terminal-triggered external URL requests.
- Validate scenario JSON with Zod before it reaches game logic.
- Use LocalStorage only through repository interfaces.
- Keep GitHub Actions permissions minimal and pin third-party actions to reviewed versions.

## MVP constraints

Use React, TypeScript, Vite, Zustand, React Router, JSON/Zod, CSS Modules, Vitest, React Testing Library, Playwright, ESLint, and Prettier. Do not add Phaser, a backend, a database, authentication, multiplayer, cloud save, or real lab infrastructure for the MVP.
