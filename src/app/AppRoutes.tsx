import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import type { LearningReview as LearningReviewModel } from '../learning'
import { parseStageResult, type StageResult } from '../game'
import type { ScenarioId } from '../scenario'
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
import { StageClearResult } from './StageClearResult'
import type { StageClearResult as StageClearResultModel } from './stageClearResultModel'
import { LanVillage } from './LanVillage'
import { LearningReview } from './LearningReview'
import { NpcEvent } from './NpcEvent'
import { MonsterCodex } from './MonsterCodex'
import { APP_ROUTES } from './routes'
import { usePlayerProgress } from './usePlayerProgress'

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

interface ResultRouteProps {
  readonly recordStageResult: (
    result: StageResult,
  ) => StageClearResultModel | null
}

function ResultRoute({ recordStageResult }: ResultRouteProps) {
  const location = useLocation()
  const result = getStageResult(location.state)
  const processed = useRef(false)
  const [progressResult, setProgressResult] = useState<
    StageClearResultModel | null | undefined
  >(undefined)

  useEffect(() => {
    if (result === null || processed.current) return
    processed.current = true
    setProgressResult(recordStageResult(result))
  }, [recordStageResult, result])

  if (result === null) {
    return (
      <Screen title="Result">
        <p>Battle結果を確認できませんでした。</p>
        <Link to={APP_ROUTES.village}>LAN Villageへ戻る</Link>
      </Screen>
    )
  }

  if (progressResult === undefined) {
    return (
      <Screen title="Result">
        <p>Stage結果を集計しています...</p>
      </Screen>
    )
  }

  if (progressResult === null) {
    return (
      <Screen title="Result">
        <p>Stage結果とScenario Dataの整合性を確認できませんでした。</p>
        <Link to={APP_ROUTES.village}>LAN Villageへ戻る</Link>
      </Screen>
    )
  }

  return (
    <StageClearResult result={progressResult} learningState={location.state} />
  )
}

function getStageResult(state: unknown): StageResult | null {
  if (typeof state === 'object' && state !== null && 'stageResult' in state) {
    return parseStageResult(state.stageResult)
  }

  return null
}

interface LearningRouteProps {
  readonly completedScenarios: readonly ScenarioId[]
}

function LearningRoute({ completedScenarios }: LearningRouteProps) {
  const location = useLocation()
  const review = getLearningReview(location.state)

  if (review !== null) {
    return (
      <LearningReview review={review} completedScenarios={completedScenarios} />
    )
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
  const { player, recordStageResult } = usePlayerProgress()

  return (
    <Routes>
      <Route
        path={APP_ROUTES.home}
        element={<Navigate to={APP_ROUTES.village} replace />}
      />
      <Route
        path={APP_ROUTES.village}
        element={<LanVillage player={player} />}
      />
      <Route
        path={APP_ROUTES.codex}
        element={<MonsterCodex player={player} />}
      />
      <Route path={APP_ROUTES.event} element={<EventRoute />} />
      <Route path={APP_ROUTES.battle} element={<BattleRoute />} />
      <Route
        path={APP_ROUTES.result}
        element={<ResultRoute recordStageResult={recordStageResult} />}
      />
      <Route
        path={APP_ROUTES.learning}
        element={
          <LearningRoute completedScenarios={player.completedScenarios} />
        }
      />
    </Routes>
  )
}
