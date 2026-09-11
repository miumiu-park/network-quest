export type BattleEngineStatus = 'IN_PROGRESS' | 'CLEARED'

export type InvestigationEffectiveness = 'EFFECTIVE' | 'INEFFECTIVE'

export const CAUSE_ANSWER_OPTIONS = [
  'IP_ADDRESS',
  'GATEWAY',
  'DNS',
  'FIREWALL',
] as const

export type CauseAnswer = (typeof CAUSE_ANSWER_OPTIONS)[number]

export type DiagnosisStatus = 'UNANSWERED' | 'INCORRECT' | 'CORRECT'

export interface BattleEngineConfig {
  readonly enemyMaxHp: number
  readonly effectiveInvestigationDamage: number
  readonly correctCause: CauseAnswer
}

export interface BattleInvestigationResult {
  readonly effectiveness: InvestigationEffectiveness
  readonly damage: number
}

export interface CauseAnswerResult {
  readonly answer: CauseAnswer
  readonly correct: boolean
}

export interface BattleEngineState {
  readonly enemyMaxHp: number
  readonly enemyHp: number
  readonly investigationCount: number
  readonly effectiveInvestigationCount: number
  readonly totalDamage: number
  readonly lastInvestigation: BattleInvestigationResult | null
  readonly causeAnswerAttempts: readonly CauseAnswerResult[]
  readonly diagnosisStatus: DiagnosisStatus
  readonly status: BattleEngineStatus
}

export interface BattleEngine {
  readonly createInitialState: () => BattleEngineState
  readonly investigate: (
    state: BattleEngineState,
    effectiveness: InvestigationEffectiveness,
  ) => BattleEngineState
  readonly submitCauseAnswer: (
    state: BattleEngineState,
    answer: CauseAnswer,
  ) => BattleEngineState
}

export function createBattleEngine(config: BattleEngineConfig): BattleEngine {
  assertPositiveInteger(config.enemyMaxHp, 'enemyMaxHp')
  assertPositiveInteger(
    config.effectiveInvestigationDamage,
    'effectiveInvestigationDamage',
  )

  const frozenConfig = Object.freeze({ ...config })

  return Object.freeze({
    createInitialState() {
      return freezeState({
        enemyMaxHp: frozenConfig.enemyMaxHp,
        enemyHp: frozenConfig.enemyMaxHp,
        investigationCount: 0,
        effectiveInvestigationCount: 0,
        totalDamage: 0,
        lastInvestigation: null,
        causeAnswerAttempts: [],
        diagnosisStatus: 'UNANSWERED',
        status: 'IN_PROGRESS',
      })
    },
    investigate(
      state: BattleEngineState,
      effectiveness: InvestigationEffectiveness,
    ) {
      if (state.status === 'CLEARED') {
        return state
      }

      const damage =
        effectiveness === 'EFFECTIVE'
          ? Math.min(frozenConfig.effectiveInvestigationDamage, state.enemyHp)
          : 0
      const enemyHp = state.enemyHp - damage

      return freezeState({
        ...state,
        enemyHp,
        investigationCount: state.investigationCount + 1,
        effectiveInvestigationCount:
          state.effectiveInvestigationCount +
          (effectiveness === 'EFFECTIVE' ? 1 : 0),
        totalDamage: state.totalDamage + damage,
        lastInvestigation: { effectiveness, damage },
        status: enemyHp === 0 ? 'CLEARED' : 'IN_PROGRESS',
      })
    },
    submitCauseAnswer(state: BattleEngineState, answer: CauseAnswer) {
      if (state.status === 'CLEARED' || state.diagnosisStatus === 'CORRECT') {
        return state
      }

      const result = Object.freeze({
        answer,
        correct: answer === frozenConfig.correctCause,
      })

      return freezeState({
        ...state,
        causeAnswerAttempts: [...state.causeAnswerAttempts, result],
        diagnosisStatus: result.correct ? 'CORRECT' : 'INCORRECT',
      })
    },
  })
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`)
  }
}

function freezeState(state: BattleEngineState): BattleEngineState {
  return Object.freeze({
    ...state,
    lastInvestigation:
      state.lastInvestigation === null
        ? null
        : Object.freeze({ ...state.lastInvestigation }),
    causeAnswerAttempts: Object.freeze(
      state.causeAnswerAttempts.map((attempt) => Object.freeze({ ...attempt })),
    ),
  })
}
