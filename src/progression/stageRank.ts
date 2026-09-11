export const STAGE_RANKS = ['S', 'A', 'B', 'C'] as const

export type StageRank = (typeof STAGE_RANKS)[number]

export interface StagePerformance {
  readonly commandCount: number
  readonly incorrectAnswerCount: number
  readonly hintCount: number
}

export interface StageRankRule {
  readonly rank: Exclude<StageRank, 'C'>
  readonly maxCommandCount: number
  readonly maxIncorrectAnswerCount: number
  readonly maxHintCount: number
}

/**
 * A performance earns the first rank whose three limits are all satisfied.
 * C is the fallback when any B-rank limit is exceeded.
 */
export const STAGE_RANK_RULES: readonly StageRankRule[] = Object.freeze([
  Object.freeze({
    rank: 'S',
    maxCommandCount: 4,
    maxIncorrectAnswerCount: 0,
    maxHintCount: 0,
  }),
  Object.freeze({
    rank: 'A',
    maxCommandCount: 6,
    maxIncorrectAnswerCount: 1,
    maxHintCount: 1,
  }),
  Object.freeze({
    rank: 'B',
    maxCommandCount: 10,
    maxIncorrectAnswerCount: 2,
    maxHintCount: 2,
  }),
])

export function evaluateStageRank(performance: StagePerformance): StageRank {
  assertNonNegativeInteger(performance.commandCount, 'commandCount')
  assertNonNegativeInteger(
    performance.incorrectAnswerCount,
    'incorrectAnswerCount',
  )
  assertNonNegativeInteger(performance.hintCount, 'hintCount')

  return (
    STAGE_RANK_RULES.find(
      (rule) =>
        performance.commandCount <= rule.maxCommandCount &&
        performance.incorrectAnswerCount <= rule.maxIncorrectAnswerCount &&
        performance.hintCount <= rule.maxHintCount,
    )?.rank ?? 'C'
  )
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer`)
  }
}
