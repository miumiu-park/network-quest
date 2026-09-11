import type { ReactNode } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import type { LearningReview as LearningReviewModel } from '../learning'
import { DNS_SLIME_SCENARIO } from '../scenario'
import { DnsSlimeBattle } from './DnsSlimeBattle'
import { LearningReview } from './LearningReview'
import { APP_ROUTES } from './routes'

interface ScreenProps {
  readonly title: string
  readonly children?: ReactNode
}

function Screen({ title, children }: ScreenProps) {
  return (
    <main id="center">
      <h1>{title}</h1>
      {children}
    </main>
  )
}

function BattleRoute() {
  const { scenarioId } = useParams<'scenarioId'>()

  if (scenarioId === undefined) {
    return <Navigate to={APP_ROUTES.village} replace />
  }

  if (scenarioId === DNS_SLIME_SCENARIO.id) {
    return <DnsSlimeBattle />
  }

  return (
    <Screen title="Battle">
      <p>Scenario: {scenarioId}</p>
      <p>このScenarioは見つかりません。</p>
      <Link to={APP_ROUTES.village}>LAN Villageへ戻る</Link>
    </Screen>
  )
}

function VillageRoute() {
  return (
    <Screen title="LAN Village">
      <p>名前解決を妨害するモンスターが現れました。</p>
      <Link to={`/battle/${DNS_SLIME_SCENARIO.id}`}>DNS Slimeに挑戦</Link>
    </Screen>
  )
}

function ResultRoute() {
  const location = useLocation()

  return (
    <Screen title="Result">
      <h2>DNS Slime 撃破</h2>
      <p>獲得EXP: {DNS_SLIME_SCENARIO.reward.exp}</p>
      <Link to={APP_ROUTES.learning} state={location.state}>
        学習レビューへ
      </Link>
    </Screen>
  )
}

function LearningRoute() {
  const location = useLocation()
  const review = getLearningReview(location.state)

  if (review !== null) {
    return <LearningReview review={review} />
  }

  return (
    <Screen title="Learning">
      <p>Battleをクリアすると、ここで調査手順を振り返れます。</p>
      <Link to={APP_ROUTES.village}>LAN Villageへ戻る</Link>
    </Screen>
  )
}

function getLearningReview(state: unknown): LearningReviewModel | null {
  if (
    typeof state !== 'object' ||
    state === null ||
    !('learningReview' in state)
  ) {
    return null
  }

  return state.learningReview as LearningReviewModel
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path={APP_ROUTES.home}
        element={<Navigate to={APP_ROUTES.village} replace />}
      />
      <Route path={APP_ROUTES.village} element={<VillageRoute />} />
      <Route path={APP_ROUTES.battle} element={<BattleRoute />} />
      <Route path={APP_ROUTES.result} element={<ResultRoute />} />
      <Route path={APP_ROUTES.learning} element={<LearningRoute />} />
    </Routes>
  )
}
