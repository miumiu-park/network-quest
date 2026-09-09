# アーキテクチャ

## 依存方向

```text
UI
  -> Game / Application
    -> Terminal / Battle / Scenario
      -> Network Simulator
        -> Scenario Data
```

依存は下方向だけに向けます。Scenario DataはSimulatorやUI codeへ依存しません。

## 責務

- `app`: composition、routing、application service
- `game`: Game Flowとaggregate state
- `battle`: investigation effectiveness、damage、回答、修復、clear条件
- `terminal`: parsing、実行、command handler、history連携
- `network`: 仮想Network Stateに対する決定的simulation
- `scenario`: schema、validation、load、Scenario Engine
- `learning`: review modelと表示用input
- `progression`: EXP、level、unlock、scoring
- `storage`: Repository interfaceとLocalStorage adapter
- `ui`: 再利用可能な表示componentのみ

## 設計ルール

- React Componentはstateを表示してapplication actionをdispatchします。Network到達性の判定やEXP計算は行いません。
- Command Handlerは検証済みargumentと仮想stateを受け取ります。
- Simulatorの処理は決定的にし、可能な限り副作用を持たせません。
- 永続化へはinterfaceを通してアクセスし、testと実装の差し替えを可能にします。
