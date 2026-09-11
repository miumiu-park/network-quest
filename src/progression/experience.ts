export const BASE_LEVEL_EXP = 100

export interface ProgressionState {
  readonly exp: number
  readonly level: number
  /** Total accumulated EXP required to reach the next level. */
  readonly nextLevelExp: number
}

export function createProgressionState(exp = 0): ProgressionState {
  assertNonNegativeSafeInteger(exp, 'exp')

  const level = calculateLevel(exp)
  const nextLevelExp = minimumExpForLevel(level + 1)

  if (!Number.isSafeInteger(nextLevelExp)) {
    throw new RangeError('exp is too large to calculate the next level safely')
  }

  return Object.freeze({ exp, level, nextLevelExp })
}

export function addExperience(
  state: ProgressionState,
  amount: number,
): ProgressionState {
  assertNonNegativeSafeInteger(amount, 'amount')

  const exp = state.exp + amount
  if (!Number.isSafeInteger(exp)) {
    throw new RangeError('total exp must be a safe integer')
  }

  return createProgressionState(exp)
}

function calculateLevel(exp: number): number {
  const estimatedLevel = Math.floor(
    (1 + Math.sqrt(1 + (4 * exp) / (BASE_LEVEL_EXP / 2))) / 2,
  )
  let level = Math.max(1, estimatedLevel)

  while (minimumExpForLevel(level + 1) <= exp) level += 1
  while (minimumExpForLevel(level) > exp) level -= 1

  return level
}

function minimumExpForLevel(level: number): number {
  return (BASE_LEVEL_EXP * (level - 1) * level) / 2
}

function assertNonNegativeSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer`)
  }
}
