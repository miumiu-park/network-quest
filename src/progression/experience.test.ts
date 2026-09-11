import { describe, expect, it } from 'vitest'
import {
  addExperience,
  BASE_LEVEL_EXP,
  createProgressionState,
} from './experience'

describe('EXP / Level model', () => {
  it('starts at level 1 with the first boundary at 100 EXP', () => {
    expect(createProgressionState()).toEqual({
      exp: 0,
      level: 1,
      nextLevelExp: 100,
    })
    expect(BASE_LEVEL_EXP).toBe(100)
  })

  it.each([
    [0, 1, 100],
    [99, 1, 100],
    [100, 2, 300],
    [299, 2, 300],
    [300, 3, 600],
    [599, 3, 600],
    [600, 4, 1000],
  ] as const)(
    'calculates exp=%i as level=%i with next boundary=%i',
    (exp, level, nextLevelExp) => {
      expect(createProgressionState(exp)).toEqual({
        exp,
        level,
        nextLevelExp,
      })
    },
  )

  it('levels up when added EXP reaches an exact boundary', () => {
    const state = createProgressionState(90)

    expect(addExperience(state, 10)).toEqual({
      exp: 100,
      level: 2,
      nextLevelExp: 300,
    })
  })

  it('supports crossing multiple level boundaries in one award', () => {
    expect(addExperience(createProgressionState(0), 650)).toEqual({
      exp: 650,
      level: 4,
      nextLevelExp: 1000,
    })
  })

  it('does not mutate the previous State', () => {
    const state = createProgressionState(99)
    const nextState = addExperience(state, 1)

    expect(state).toEqual({ exp: 99, level: 1, nextLevelExp: 100 })
    expect(nextState).not.toBe(state)
    expect(Object.isFrozen(state)).toBe(true)
    expect(Object.isFrozen(nextState)).toBe(true)
  })

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid initial EXP %s',
    (exp) => {
      expect(() => createProgressionState(exp)).toThrow(
        'exp must be a non-negative safe integer',
      )
    },
  )

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid award amount %s',
    (amount) => {
      expect(() => addExperience(createProgressionState(), amount)).toThrow(
        'amount must be a non-negative safe integer',
      )
    },
  )

  it('rejects an award that exceeds safe integer precision', () => {
    const state = createProgressionState(100)

    expect(() => addExperience(state, Number.MAX_SAFE_INTEGER)).toThrow(
      'total exp must be a safe integer',
    )
  })
})
