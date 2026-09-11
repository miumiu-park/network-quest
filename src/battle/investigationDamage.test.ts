import { describe, expect, it, vi } from 'vitest'
import type { InvestigationObservation } from '../investigation'
import { createBattleEngine } from './battleEngine'
import { applyInvestigationObservations } from './investigationDamage'

const engine = createBattleEngine({
  enemyMaxHp: 100,
  effectiveInvestigationDamage: 30,
})

function isDnsFailure(observation: InvestigationObservation): boolean {
  return observation.kind === 'DNS_RESOLUTION' && !observation.resolved
}

describe('applyInvestigationObservations', () => {
  it('does not change Battle State for a command without observations', () => {
    const state = engine.createInitialState()
    const evaluator = vi.fn(isDnsFailure)

    const nextState = applyInvestigationObservations(
      engine,
      state,
      [],
      evaluator,
    )

    expect(nextState).toBe(state)
    expect(nextState.enemyHp).toBe(100)
    expect(nextState.investigationCount).toBe(0)
    expect(evaluator).not.toHaveBeenCalled()
  })

  it('does not deal damage for an ineffective observation', () => {
    const state = applyInvestigationObservations(
      engine,
      engine.createInitialState(),
      [
        {
          kind: 'GATEWAY_REACHABILITY',
          target: 'gateway',
          reachable: true,
        },
      ],
      isDnsFailure,
    )

    expect(state).toMatchObject({
      enemyHp: 100,
      investigationCount: 1,
      effectiveInvestigationCount: 0,
      totalDamage: 0,
      lastInvestigation: { effectiveness: 'INEFFECTIVE', damage: 0 },
    })
  })

  it('deals damage only when an observation is effective', () => {
    const state = applyInvestigationObservations(
      engine,
      engine.createInitialState(),
      [
        {
          kind: 'DNS_RESOLUTION',
          hostname: 'quest.example',
          resolved: false,
        },
      ],
      isDnsFailure,
    )

    expect(state).toMatchObject({
      enemyHp: 70,
      investigationCount: 1,
      effectiveInvestigationCount: 1,
      totalDamage: 30,
      lastInvestigation: { effectiveness: 'EFFECTIVE', damage: 30 },
    })
  })

  it('applies at most one investigation for one command result', () => {
    const state = applyInvestigationObservations(
      engine,
      engine.createInitialState(),
      [
        {
          kind: 'GATEWAY_REACHABILITY',
          target: 'gateway',
          reachable: true,
        },
        {
          kind: 'DNS_RESOLUTION',
          hostname: 'quest.example',
          resolved: false,
        },
      ],
      isDnsFailure,
    )

    expect(state).toMatchObject({
      enemyHp: 70,
      investigationCount: 1,
      effectiveInvestigationCount: 1,
      totalDamage: 30,
    })
  })

  it('does not mutate the previous State or observations', () => {
    const state = engine.createInitialState()
    const observations: readonly InvestigationObservation[] = [
      {
        kind: 'DNS_RESOLUTION',
        hostname: 'quest.example',
        resolved: false,
      },
    ]

    const nextState = applyInvestigationObservations(
      engine,
      state,
      observations,
      isDnsFailure,
    )

    expect(state.enemyHp).toBe(100)
    expect(observations).toEqual([
      {
        kind: 'DNS_RESOLUTION',
        hostname: 'quest.example',
        resolved: false,
      },
    ])
    expect(nextState).not.toBe(state)
    expect(Object.isFrozen(nextState)).toBe(true)
  })
})
