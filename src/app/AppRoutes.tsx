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
import {
  DNS_SLIME_SCENARIO,
  GATEWAY_GOBLIN_SCENARIO,
  IP_SLIME_SCENARIO,
  SUBNET_GOLEM_SCENARIO,
} from '../scenario'
import { DnsSlimeBattle } from './DnsSlimeBattle'
import { GatewayGoblinBattle } from './GatewayGoblinBattle'
import { IpSlimeBattle } from './IpSlimeBattle'
import { SubnetGolemBattle } from './SubnetGolemBattle'
import { LanVillage } from './LanVillage'
import { LearningReview } from './LearningReview'
import { NpcEvent } from './NpcEvent'
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

  if (scenarioId === GATEWAY_GOBLIN_SCENARIO.id) {
    return <GatewayGoblinBattle />
  }

  if (scenarioId === IP_SLIME_SCENARIO.id) {
    return <IpSlimeBattle />
  }

  if (scenarioId === SUBNET_GOLEM_SCENARIO.id) {
    return <SubnetGolemBattle />
  }

  return (
    <Screen title="Battle">
      <p>Scenario: {scenarioId}</p>
      <p>このScenarioは見つかりません。</p>
      <Link to={APP_ROUTES.village}>LAN Villageへ戻る</Link>
    </Screen>
  )
}

function EventRoute() {
  const { scenarioId } = useParams<'scenarioId'>()

  if (scenarioId === undefined) {
    return <Navigate to={APP_ROUTES.village} replace />
  }

  if (scenarioId === DNS_SLIME_SCENARIO.id) {
    return <NpcEvent scenario={DNS_SLIME_SCENARIO} />
  }

  if (scenarioId === GATEWAY_GOBLIN_SCENARIO.id) {
    return <NpcEvent scenario={GATEWAY_GOBLIN_SCENARIO} />
  }

  if (scenarioId === IP_SLIME_SCENARIO.id) {
    return <NpcEvent scenario={IP_SLIME_SCENARIO} />
  }

  if (scenarioId === SUBNET_GOLEM_SCENARIO.id) {
    return <NpcEvent scenario={SUBNET_GOLEM_SCENARIO} />
  }

  return (
    <Screen title="NPC Event">
      <p>この依頼は見つかりません。</p>
      <Link to={APP_ROUTES.village}>LAN Villageへ戻る</Link>
    </Screen>
  )
}

function ResultRoute() {
  const location = useLocation()
  const result = getResultSummary(location.state)

  return (
    <Screen title="Result">
      <h2>{result.enemyName} 撃破</h2>
      <p>獲得EXP: {result.exp}</p>
      <Link to={APP_ROUTES.learning} state={location.state}>
        学習レビューへ
      </Link>
    </Screen>
  )
}

interface ResultSummary {
  readonly enemyName: string
  readonly exp: number
}

function getResultSummary(state: unknown): ResultSummary {
  if (
    typeof state === 'object' &&
    state !== null &&
    'resultSummary' in state &&
    typeof state.resultSummary === 'object' &&
    state.resultSummary !== null &&
    'enemyName' in state.resultSummary &&
    typeof state.resultSummary.enemyName === 'string' &&
    'exp' in state.resultSummary &&
    typeof state.resultSummary.exp === 'number'
  ) {
    return state.resultSummary as ResultSummary
  }

  return {
    enemyName: DNS_SLIME_SCENARIO.enemy.name,
    exp: DNS_SLIME_SCENARIO.reward.exp,
  }
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
      <Route path={APP_ROUTES.village} element={<LanVillage />} />
      <Route path={APP_ROUTES.event} element={<EventRoute />} />
      <Route path={APP_ROUTES.battle} element={<BattleRoute />} />
      <Route path={APP_ROUTES.result} element={<ResultRoute />} />
      <Route path={APP_ROUTES.learning} element={<LearningRoute />} />
    </Routes>
  )
}
