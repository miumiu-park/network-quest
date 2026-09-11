import type { InvestigationHistoryEntry } from '../investigation'
import type { Scenario, ScenarioId } from '../scenario'

export interface LearningReviewCause {
  readonly type: string
  readonly description: string
}

export interface LearningReviewStep {
  readonly command: string
  readonly result: string
}

export interface LearningReview {
  readonly scenarioId: ScenarioId
  readonly symptom: string
  readonly cause: LearningReviewCause
  readonly usedCommands: readonly string[]
  readonly investigationSteps: readonly LearningReviewStep[]
  readonly recommendedSteps: readonly string[]
  readonly reasoning: string
}

export function createLearningReview(
  scenario: Scenario,
  history: readonly InvestigationHistoryEntry[],
): LearningReview {
  const investigationSteps = history.map((entry) =>
    Object.freeze({
      command: [entry.command, ...entry.args].join(' '),
      result: entry.result.text,
    }),
  )
  const usedCommands = [...new Set(history.map((entry) => entry.command))]

  return Object.freeze({
    scenarioId: scenario.id,
    symptom: scenario.title,
    cause: Object.freeze({
      type: scenario.answer.cause,
      description: scenario.failure.description,
    }),
    usedCommands: Object.freeze(usedCommands),
    investigationSteps: Object.freeze(investigationSteps),
    recommendedSteps: Object.freeze([...scenario.learning.keyPoints]),
    reasoning: scenario.learning.summary,
  })
}
