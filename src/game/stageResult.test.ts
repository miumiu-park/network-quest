import { describe, expect, it } from 'vitest'
import { createBattleEngine } from '../battle'
import { IP_SLIME_SCENARIO } from '../scenario'
import { createStageResult, parseStageResult } from './stageResult'

describe('Stage Result', () => {
  it('derives rank metrics from the shared battle result contract', () => {
    const engine = createBattleEngine({
      enemyMaxHp: 100,
      effectiveInvestigationDamage: 30,
      correctCause: 'IP_ADDRESS',
    })
    const incorrect = engine.submitCauseAnswer(
      engine.createInitialState(),
      'DNS',
    )
    const correct = engine.submitCauseAnswer(incorrect, 'IP_ADDRESS')

    expect(
      createStageResult({
        scenario: IP_SLIME_SCENARIO,
        battleState: correct,
        commandCount: 5,
      }),
    ).toEqual({
      scenarioId: 'ip-slime',
      enemyName: 'IP Slime',
      exp: 100,
      performance: {
        commandCount: 5,
        incorrectAnswerCount: 1,
        hintCount: 0,
      },
      rank: 'A',
    })
  })

  it('accepts only result data whose rank matches its performance', () => {
    const valid = {
      scenarioId: 'ip-slime',
      enemyName: 'IP Slime',
      exp: 100,
      performance: {
        commandCount: 4,
        incorrectAnswerCount: 0,
        hintCount: 0,
      },
      rank: 'S',
    }

    expect(parseStageResult(valid)).toEqual(valid)
    expect(parseStageResult({ ...valid, rank: 'C' })).toBeNull()
  })

  it('uses the revealed hint count in the existing rank rules', () => {
    const engine = createBattleEngine({
      enemyMaxHp: 100,
      effectiveInvestigationDamage: 30,
      correctCause: 'IP_ADDRESS',
    })

    expect(
      createStageResult({
        scenario: IP_SLIME_SCENARIO,
        battleState: engine.createInitialState(),
        commandCount: 3,
        hintCount: 2,
      }),
    ).toMatchObject({
      performance: { hintCount: 2 },
      rank: 'B',
    })
  })
})
