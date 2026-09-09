# Architecture

## Dependency direction

```text
UI
  -> Game / Application
    -> Terminal / Battle / Scenario
      -> Network Simulator
        -> Scenario Data
```

Dependencies must point downward. Scenario data does not depend on simulator or UI code.

## Responsibilities

- `app`: composition, routing, and application services
- `game`: game flow and aggregate state
- `battle`: investigation effectiveness, damage, answers, repairs, and clear conditions
- `terminal`: parsing, execution, command handlers, and history integration
- `network`: deterministic simulation over virtual network state
- `scenario`: schema, validation, loading, and scenario engine
- `learning`: review model and presentation inputs
- `progression`: EXP, level, unlocks, and scoring
- `storage`: repository interfaces and LocalStorage adapters
- `ui`: reusable presentation components only

## Design rules

- React components render state and dispatch application actions; they do not decide network reachability or calculate EXP.
- Command handlers receive validated arguments and virtual state.
- Simulator operations are deterministic and side-effect free where practical.
- Persistence is accessed through interfaces so it can be tested and replaced.
