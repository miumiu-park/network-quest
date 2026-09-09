# セキュリティモデル

疑似Terminalはgame interfaceであり、system terminalではありません。

```text
User Input
  -> Command Parser
    -> Command Executor
      -> Network Simulator
```

すべての結果は検証済みScenario Stateから生成します。TerminalはOS Shell、`eval`、`new Function`、`child_process`、実ping、実DNS、任意の外部URLを決して呼び出しません。未知のcommandや不正なargumentには、制御されたgame errorを返します。

Scenario JSONは信頼できないinputとして扱い、Game Engineへ渡す前にZod Schemaを通過させます。GitHub Actionsは、限定されたdeploy jobで明示的に必要な場合を除き、repositoryへのread-only permissionsを使用します。
