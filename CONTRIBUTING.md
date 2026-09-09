# Contributing

## Issue-driven workflow

1. Choose or create one Issue with a clear objective and acceptance criteria.
2. Branch from current `main` using `feature/issue-<number>-<topic>`, `fix/issue-<number>-<topic>`, or `docs/issue-<number>-<topic>`.
3. Commit only the work required by that Issue.
4. Open a pull request that links the Issue.
5. Wait for CI, resolve all conversations, and obtain at least one approval.
6. Update from `main` when required, then squash merge.

Direct pushes, force pushes, and deletion of `main` are prohibited.

## Definition of done

- Acceptance criteria are met.
- Tests cover changed behavior.
- `npm run lint`, `npm test`, and `npm run build` pass when those scripts are available.
- No real shell or network execution is introduced through the pseudo-terminal.
- Documentation is updated when behavior or architecture changes.
