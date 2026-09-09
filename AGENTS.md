# AGENTS.md

## 適用範囲

この指示はリポジトリ全体へ適用します。

## 開発フロー

- 1つの明確な目的を持つGitHub Issueから作業を開始します。
- `main`からbranchを作成し、`main`へ直接commitしません。
- Pull Requestは小さく焦点を絞り、対象Issueへリンクします。
- review依頼前にlint、test、buildを実行します。
- 関係のないroadmap項目を実装しません。

## アーキテクチャ境界

次の依存方向を維持します。

`UI -> Game/Application -> Terminal/Battle/Scenario -> Network Simulator -> Scenario Data`

Game Flow、Scenario Engine、Terminal Parser、Command Executor、Network Simulator、Investigation History、Battle Engine、Scoring、Progression、Learning Review、Storageを分離します。React Componentにはネットワーク障害判定、EXP計算、永続化の詳細を記述しません。

## セキュリティ不変条件

- Terminal入力は必ず`Command Parser -> Command Executor -> Network Simulator`だけを通します。
- `eval`、`new Function`、`child_process`、Shell実行、実ping/DNS、Terminalを起点とする外部URL requestを使用しません。
- Scenario JSONはgame logicへ渡す前にZodで検証します。
- LocalStorageはRepository interfaceを通してのみ利用します。
- GitHub Actionsのpermissionsを最小限にし、third-party actionはreview済みversionへ固定します。

## MVPの制約

React、TypeScript、Vite、Zustand、React Router、JSON/Zod、CSS Modules、Vitest、React Testing Library、Playwright、ESLint、Prettierを使用します。MVPへPhaser、Backend、Database、Authentication、Multiplayer、Cloud Save、Real Lab基盤を追加しません。
