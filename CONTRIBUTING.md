# コントリビューションガイド

## Issue駆動の開発フロー

1. 明確な目的と完了条件を持つIssueを選択または作成します。
2. 最新の`main`から`feature/issue-<number>-<topic>`、`fix/issue-<number>-<topic>`、`docs/issue-<number>-<topic>`のいずれかでbranchを作成します。
3. 対象Issueに必要な変更だけをcommitします。
4. IssueへリンクしたPull Requestを作成します。
5. CIの完了を待ち、すべてのconversationを解決し、1名以上のApproveを得ます。
6. 必要に応じて最新の`main`へ更新し、Squash Mergeします。

`main`への直接push、force push、branch deletionは禁止します。

## 完了の定義

- Issueの完了条件を満たしています。
- 変更した振る舞いをtestで検証しています。
- scriptが利用可能な場合、`npm run lint`、`npm test`、`npm run build`が成功します。
- 疑似Terminalから実Shellや実ネットワークを実行する処理を導入していません。
- 振る舞いまたはarchitectureを変更した場合、文書も更新しています。
