import { describe, expect, it } from 'vitest'
import { createBattleEngine } from './battleEngine'

describe('createBattleEngine', () => {
  const engine = createBattleEngine({
    enemyMaxHp: 100,
    effectiveInvestigationDamage: 30,
    correctCause: 'DNS',
  })

  it('creates an immutable battle state with full enemy HP', () => {
    const state = engine.createInitialState()

    expect(state).toEqual({
      enemyMaxHp: 100,
      enemyHp: 100,
      investigationCount: 0,
      effectiveInvestigationCount: 0,
      totalDamage: 0,
      lastInvestigation: null,
      causeAnswerAttempts: [],
      diagnosisStatus: 'UNANSWERED',
      status: 'IN_PROGRESS',
    })
    expect(Object.isFrozen(state)).toBe(true)
  })

  it('deals configured damage for an effective investigation', () => {
    const initialState = engine.createInitialState()
    const state = engine.investigate(initialState, 'EFFECTIVE')

    expect(state).toMatchObject({
      enemyHp: 70,
      investigationCount: 1,
      effectiveInvestigationCount: 1,
      totalDamage: 30,
      lastInvestigation: { effectiveness: 'EFFECTIVE', damage: 30 },
      status: 'IN_PROGRESS',
    })
    expect(initialState.enemyHp).toBe(100)
    expect(Object.isFrozen(state)).toBe(true)
    expect(Object.isFrozen(state.lastInvestigation)).toBe(true)
  })

  it('records an ineffective investigation without dealing damage', () => {
    const state = engine.investigate(engine.createInitialState(), 'INEFFECTIVE')

    expect(state).toMatchObject({
      enemyHp: 100,
      investigationCount: 1,
      effectiveInvestigationCount: 0,
      totalDamage: 0,
      lastInvestigation: { effectiveness: 'INEFFECTIVE', damage: 0 },
      status: 'IN_PROGRESS',
    })
  })

  it('clamps damage to remaining HP and clears the battle', () => {
    const finishingEngine = createBattleEngine({
      enemyMaxHp: 20,
      effectiveInvestigationDamage: 30,
      correctCause: 'DNS',
    })
    const state = finishingEngine.investigate(
      finishingEngine.createInitialState(),
      'EFFECTIVE',
    )

    expect(state).toMatchObject({
      enemyHp: 0,
      totalDamage: 20,
      lastInvestigation: { effectiveness: 'EFFECTIVE', damage: 20 },
      status: 'CLEARED',
    })
  })

  it('accumulates investigation effectiveness and damage', () => {
    const afterFirst = engine.investigate(
      engine.createInitialState(),
      'EFFECTIVE',
    )
    const afterSecond = engine.investigate(afterFirst, 'INEFFECTIVE')
    const afterThird = engine.investigate(afterSecond, 'EFFECTIVE')

    expect(afterThird).toMatchObject({
      enemyHp: 40,
      investigationCount: 3,
      effectiveInvestigationCount: 2,
      totalDamage: 60,
    })
  })

  it('does not change a cleared battle', () => {
    const finishingEngine = createBattleEngine({
      enemyMaxHp: 10,
      effectiveInvestigationDamage: 10,
      correctCause: 'DNS',
    })
    const clearedState = finishingEngine.investigate(
      finishingEngine.createInitialState(),
      'EFFECTIVE',
    )

    expect(finishingEngine.investigate(clearedState, 'EFFECTIVE')).toBe(
      clearedState,
    )
  })

  it.each([
    [
      {
        enemyMaxHp: 0,
        effectiveInvestigationDamage: 10,
        correctCause: 'DNS',
      },
      'enemyMaxHp',
    ],
    [
      {
        enemyMaxHp: 10,
        effectiveInvestigationDamage: 1.5,
        correctCause: 'DNS',
      },
      'effectiveInvestigationDamage',
    ],
  ] as const)('rejects invalid config %o', (config, invalidField) => {
    expect(() => createBattleEngine(config)).toThrow(
      `${invalidField} must be a positive integer`,
    )
  })
})
