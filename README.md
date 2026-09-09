# Network Quest

Network Quest is a network troubleshooting RPG for learning practical networking skills through gameplay.

## MVP

Explore LAN Village, encounter an enemy, investigate a simulated network through a safe pseudo-terminal, identify and repair the fault, verify recovery, earn EXP, and review what you learned.

The MVP has no backend or database. Terminal commands operate only on scenario-defined virtual network state; they never invoke an OS shell or access a real network.

## Architecture

```text
UI
  -> Game / Application
    -> Terminal / Battle / Scenario
      -> Network Simulator
        -> Scenario Data
```

Game flow, scenario engine, terminal parser/executor, network simulator, investigation history, battle/scoring, progression, learning review, and storage are separate responsibilities. Domain logic must not be embedded in React components.

See [docs/architecture.md](docs/architecture.md) and [docs/security.md](docs/security.md).

## Technology stack

- React, TypeScript, Vite
- Zustand, React Router
- JSON scenarios validated with Zod
- CSS Modules
- Vitest, React Testing Library, Playwright
- ESLint, Prettier, GitHub Actions
- LocalStorage behind a repository interface

Phaser, backend APIs, databases, authentication, multiplayer, and real network access are outside the MVP.

## Setup, development, and testing

Project scaffolding is intentionally tracked in Issue #1. Once it is complete:

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
```

## Adding a scenario

1. Add JSON under `scenarios/chapter-01/` or `scenarios/bosses/`.
2. Conform to the Scenario schema.
3. Load through the Scenario Loader and validate with Zod before use.
4. Add simulator and gameplay tests without real network calls.

## Branch and pull request workflow

- Start each change from one focused Issue.
- Create a branch from `main`, for example `feature/issue-12-terminal-ui`.
- Never work directly on `main`.
- Open a pull request and wait for CI.
- Resolve every review conversation and obtain at least one approval.
- Squash merge after checks and review succeed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
