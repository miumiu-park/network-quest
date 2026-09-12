# Network Quest

Network Questは、ゲームを通して実践的なnetwork troubleshootingを学ぶRPGです。LAN Villageで依頼を受け、安全な疑似Terminalを使って障害を調査し、原因の特定、設定の修復、復旧確認、学習レビューまでを体験できます。

## MVPの目的

MVPでは、次の一連の学習体験を提供します。

1. LAN VillageでNPCやモンスターから依頼を受ける。
2. `ping`、`nslookup`、`ip`を疑似Terminalで実行する。
3. 観測結果から障害原因を回答する。
4. Scenario内の仮想Network Stateを修復する。
5. 同じ調査を再実行して復旧を確認する。
6. EXPを獲得し、Learning Reviewで調査手順を振り返る。

Backend、Database、Authentication、Multiplayer、Cloud Save、実Lab基盤はMVPの対象外です。疑似TerminalはOS Shellや実networkへ接続しません。

## アーキテクチャ

依存方向は次の順序を維持します。

```text
UI
  -> Game / Application
    -> Terminal / Battle / Scenario
      -> Network Simulator
        -> Scenario Data
```

Game Flow、Scenario Engine、Terminal Parser、Command Executor、Network Simulator、Investigation History、Battle Engine、Scoring、Progression、Learning Review、Storageを分離します。React Componentにはnetwork障害判定、EXP計算、永続化の詳細を記述しません。

- [Architecture詳細](docs/architecture.md)
- [Security方針](docs/security.md)
- [Scoring仕様](docs/scoring.md)

## Technology Stack

- React 19、TypeScript、Vite
- React Router
- JSON Scenario、Zod validation
- CSS Modules
- Vitest、React Testing Library
- Playwright / Chromium
- ESLint、Prettier
- GitHub Actions

## Project構成

```text
src/app/                 画面・route・UI component
src/battle/              Battle Engineと修復確認
src/investigation/       調査履歴と観測結果
src/learning/            Learning Review
src/network/             仮想Network StateとSimulator
src/scenario/data/       Zodで検証するScenario JSON
src/terminal/            Parser、Executor、疑似Terminal UI
e2e/                     Playwright E2E Test
.github/workflows/       CIとdeploy Workflow
```

## Setup

Node.js 22とnpmを使用します。

```sh
git clone https://github.com/miumiu-park/network-quest.git
cd network-quest
npm ci
```

開発serverを起動します。

```sh
npm run dev
```

Viteが表示したlocal URLをbrowserで開きます。通常は`http://localhost:5173/`です。

## Development・Test command

| Command                | 用途                                              |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Vite development serverを起動                     |
| `npm run lint`         | ESLintを実行                                      |
| `npm run format`       | Prettierでformat                                  |
| `npm run format:check` | format差分がないことを検証                        |
| `npm test -- --run`    | VitestのUnit・Component Testを1回実行             |
| `npm run build`        | TypeScript検査後にproduction buildを`dist/`へ生成 |
| `npm run preview`      | production buildをlocal preview                   |
| `npm run test:e2e`     | PlaywrightでE2E Testを実行                        |

初回のE2E実行前にChromiumをinstallします。

```sh
npx playwright install chromium
npm run test:e2e
```

Linux CI相当のbrowser依存関係もinstallする場合は、`npx playwright install --with-deps chromium`を使用します。E2Eは専用port `4173`で現在のworking treeからVite serverを起動するため、別のdevelopment serverを停止する必要はありません。

Pull Requestのreview依頼前には、少なくとも次を実行します。

```sh
npm run lint
npm run format:check
npm test -- --run
npm run build
npm run test:e2e
```

## Scenarioの追加

1. `src/scenario/data/`へScenario JSONを追加する。
2. `src/scenario/*Scenario.ts`から`loadScenario`を呼び、Zod validationを通す。
3. `src/scenario/index.ts`からScenarioと必要な定数をexportする。
4. Network Simulator、修復処理、Battle画面へ責務を分けて実装する。
5. Event・Battle routeとLAN Villageの導線を追加する。
6. Scenario validation、Network、Battle完走のtestを追加する。

Scenario JSONを直接game logicへ渡してはいけません。Terminal入力は必ず`Command Parser -> Command Executor -> Network Simulator`を通します。

## Deploy

このapplicationは`npm run build`で生成される`dist/`だけを配信する静的SPAです。

### 現在の状態（2026-09-12）

`.github/workflows/deploy-pages.yml`にはGitHub Pages用Workflowがありますが、現状のrepositoryではGitHub Pages siteが有効化されていません。`actions/configure-pages`がPages siteを取得できず、Workflowは`Not Found`で失敗します。

GitHub Pagesを有効化できるまでは、後述のCloudflare Pages、Netlify、Vercelなどを利用してください。現在の構成ではCloudflare Pagesが追加fileなしでSPA routeを扱えるため、最も少ない変更で導入できます。

### 方法1: GitHub Pages

RepositoryのAdminまたはMaintainerが設定を変更できる場合の手順です。

1. GitHubの`Settings -> Pages`を開く。
2. `Build and deployment -> Source`で`GitHub Actions`を選択する。
3. 必要なら`github-pages` environmentへ、deployment branchを`main`だけに制限するprotection ruleを設定する。
4. `main`へmergeするか、Actions画面から`Deploy GitHub Pages`を手動実行する。
5. `build-pages`と`deploy-pages`の成功、および表示されたdeployment URLを確認する。

WorkflowはPages用buildだけに`VITE_BASE_PATH=/network-quest/`を設定し、`dist/404.html`をSPA fallbackとして生成します。権限は`contents: read`、`pages: write`、`id-token: write`だけです。

- [GitHub: Publishing sourceの設定](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub: Custom Pages Workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

### 方法2: Cloudflare Pages（代替の第一候補）

1. Cloudflareの`Workers & Pages`からGitHub repositoryを接続する。
2. Production branchを`main`にする。
3. Build commandを`npm run build`にする。
4. Build output directoryを`dist`にする。
5. Root directoryはrepository rootのままにする。
6. Node.js versionを`22`に設定してdeployする。

`VITE_BASE_PATH`は設定しません。Cloudflare PagesのURL rootへ配信するため、Viteの既定base `/`を使用します。`dist`直下に`404.html`がなければCloudflare PagesがSPAとして扱い、`/battle/dns-slime`などの直接アクセスを`index.html`へfallbackします。

- [Cloudflare Pages: Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages: SPA rendering](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering)

### 方法3: Netlify

1. NetlifyへGitHub repositoryをimportする。
2. Production branchを`main`にする。
3. Build commandを`npm run build`にする。
4. Publish directoryを`dist`にする。
5. `VITE_BASE_PATH`は設定せずdeployする。

React Routerの直接アクセスに対応するには、Netlify側で次のrewriteを追加します。

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [Netlify: Viteのdeploy](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- [Netlify: SPA rewrite](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)

### 方法4: Vercel

1. VercelへGitHub repositoryをimportする。
2. Framework Presetを`Vite`にする。
3. Build commandを`npm run build`、Output Directoryを`dist`にする。
4. `VITE_BASE_PATH`は設定せずdeployする。

SPAのdeep linkへ対応するには、repository rootへ次の`vercel.json`相当のrewrite設定が必要です。

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [Vercel: Vite](https://vercel.com/docs/frameworks/frontend/vite)

### 方法5: 任意の静的hosting

```sh
npm ci
npm run build
```

生成された`dist/`の内容をobject storage、CDN、Web serverなどへuploadします。配信先ではHTTPSを有効にし、存在しないnavigation requestを`/index.html`へrewriteしてください。subpathへ配信する場合だけ、build時に`VITE_BASE_PATH=/公開path/`を設定します。

### 選択基準

| 方法              | 選ぶ条件                               | SPA対応                                    |
| ----------------- | -------------------------------------- | ------------------------------------------ |
| GitHub Pages      | Repository設定でPagesを有効化できる    | Workflowが`404.html`を生成                 |
| Cloudflare Pages  | Pagesを使えず、最小構成でGit連携したい | top-level `404.html`がなければ自動fallback |
| Netlify           | NetlifyのGit deployを利用したい        | rewrite設定が必要                          |
| Vercel            | VercelのGit deployを利用したい         | `vercel.json` rewriteが必要                |
| 任意の静的hosting | 配信基盤を自分で管理する               | server/CDN側のrewriteが必要                |

どの方法でも、production公開前に`npm run lint`、`npm test -- --run`、`npm run build`、`npm run test:e2e`が成功していることを確認します。外部hostingへrepositoryを接続する場合は、必要なrepositoryだけを許可し、不要なwrite権限やsecretを付与しません。

## Branch / Pull Request運用

1. 1つの明確な目的と完了条件を持つIssueから開始する。
2. 最新の`main`からIssue専用branchを作成する。
3. 対象Issueに必要な変更だけをcommitする。
4. `Closes #<issue number>`でIssueへリンクしたPull Requestを作成する。
5. lint、format、test、build、必要なE2Eを実行する。
6. CI成功後にreviewを受け、すべてのconversationを解決する。
7. 1名以上のApprove後にSquash Mergeする。

`main`への直接commitやforce pushは行いません。詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。
