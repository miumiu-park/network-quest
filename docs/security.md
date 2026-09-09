# Security model

The pseudo-terminal is a game interface, not a system terminal.

```text
User Input
  -> Command Parser
    -> Command Executor
      -> Network Simulator
```

All results are derived from validated scenario state. The terminal must never call an OS shell, `eval`, `new Function`, `child_process`, real ping, real DNS, or arbitrary external URLs. Unknown commands and invalid arguments return controlled game errors.

Scenario JSON is untrusted input and must pass a Zod schema before entering the game engine. GitHub Actions use read-only repository permissions unless a narrowly scoped deployment job explicitly requires more.
