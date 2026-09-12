# Network Quest

Network Questは、ゲームを通して実践的なネットワークスキルを学ぶ、ネットワークトラブルシューティングRPGです。

## MVPの目的

LAN Villageを探索し、敵と遭遇し、安全な疑似Terminalで仮想ネットワークを調査します。原因の特定、設定の修復、復旧確認を経て敵を撃破し、EXPを獲得して学習内容を振り返るまでを、MVPのコア体験とします。

MVPにはBackendやDatabaseを設けません。Terminal commandはScenarioで定義された仮想Network Stateだけを操作し、OS Shellの実行や実ネットワークへの接続は行いません。

## アーキテクチャ

```text
UI
  -> Game / Application
    -> Terminal / Battle / Scenario
      -> Network Simulator
        -> Scenario Data
```

Game Flow、Scenario Engine、Terminal Parser/Executor、Network Simulator、Investigation History、Battle/Scoring、Progression、Learning Review、Storageの責務を分離します。React Componentへドメインロジックを直接記述しません。

[アーキテクチャ詳細](docs/architecture.md)と[セキュリティ方針](docs/security.md)も参照してください。

## 技術スタック

- React, TypeScript, Vite
- Zustand, React Router
- JSON形式のScenarioとZodによるvalidation
- CSS Modules
- Vitest, React Testing Library, Playwright
- ESLint, Prettier, GitHub Actions
- Repository interfaceを経由したLocalStorage
- Backend API、Database、Authentication、Multiplayer、実ネットワーク通信はMVP対象外

Phaserは使用せず、大規模UI libraryも導入しません。

## Setup・開発・テスト

依存関係をinstallした後、以下のcommandを利用できます。

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
```

## Scenarioの追加

1. `scenarios/chapter-01/`または`scenarios/bosses/`へJSONを追加します。
2. Scenario Schemaへ準拠させます。
3. Scenario Loaderを通し、利用前にZodで検証します。
4. 実ネットワークへ接続しないSimulator・gameplay testを追加します。

## Branch / Pull Request運用

- 1つの明確な目的を持つIssueから作業を開始します。
- `main`から、例として`feature/issue-12-terminal-ui`のようなbranchを作成します。
- `main`上で直接作業しません。
- Pull Requestを作成してCIの完了を待ちます。
- すべてのreview conversationを解決し、1名以上のApproveを得ます。
- CIとreviewの成功後にSquash Mergeします。

詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

## GitHub Pages

`main`へmergeされると、GitHub Actionsがproduction buildを作成し、GitHub Pagesへdeployします。公開先ではrepository名をbase pathとして使用し、SPAの直接アクセスには`404.html` fallbackを利用します。
