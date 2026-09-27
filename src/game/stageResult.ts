import type { BattleEngineState } from '../battle'
import {
  evaluateStageRank,
  type StagePerformance,
  type StageRank,
} from '../progression'
import type { Scenario, ScenarioId } from '../scenario'

export interface StageResult {
  readonly scenarioId: ScenarioId
  readonly enemyName: string
  readonly exp: number
  readonly performance: StagePerformance
  readonly rank: StageRank
}

export interface StageResultInput {
  readonly scenario: Scenario
  readonly battleState: BattleEngineState
  readonly commandCount: number
  readonly hintCount?: number
}

export function createStageResult({
  scenario,
  battleState,
  commandCount,
  hintCount = 0,
}: StageResultInput): StageResult {
  const performance = Object.freeze({
    commandCount,
    incorrectAnswerCount: battleState.causeAnswerAttempts.filter(
      (attempt) => !attempt.correct,
    ).length,
    hintCount,
  })

  return Object.freeze({
    scenarioId: scenario.id,
    enemyName: scenario.enemy.name,
    exp: scenario.reward.exp,
    performance,
    rank: evaluateStageRank(performance),
  })
}

export function parseStageResult(value: unknown): StageResult | null {
  if (typeof value !== 'object' || value === null) return null

  const candidate = value as Partial<StageResult>
  const performance = candidate.performance
  const exp = candidate.exp
  if (
    typeof candidate.scenarioId !== 'string' ||
    typeof candidate.enemyName !== 'string' ||
    typeof exp !== 'number' ||
    !Number.isSafeInteger(exp) ||
    exp < 0 ||
    typeof performance !== 'object' ||
    performance === null
  ) {
    return null
  }

  try {
    const normalizedPerformance = Object.freeze({
      commandCount: performance.commandCount,
      incorrectAnswerCount: performance.incorrectAnswerCount,
      hintCount: performance.hintCount,
    })
    const rank = evaluateStageRank(normalizedPerformance)
    if (candidate.rank !== rank) return null

    return Object.freeze({
      scenarioId: candidate.scenarioId,
      enemyName: candidate.enemyName,
      exp,
      performance: normalizedPerformance,
      rank,
    })
  } catch {
    return null
  }
}
