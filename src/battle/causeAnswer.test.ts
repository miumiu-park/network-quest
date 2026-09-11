import { describe, expect, it } from 'vitest'
import { CAUSE_ANSWER_OPTIONS, createBattleEngine } from './battleEngine'

const dnsSlimeBattle = createBattleEngine({
  enemyMaxHp: 100,
  effectiveInvestigationDamage: 30,
  correctCause: 'DNS',
})

describe('cause answer', () => {
  it('provides the four supported cause choices', () => {
    expect(CAUSE_ANSWER_OPTIONS).toEqual([
      'IP_ADDRESS',
      'GATEWAY',
      'DNS',
      'FIREWALL',
    ])
  })

  it.each(['IP_ADDRESS', 'GATEWAY', 'FIREWALL'] as const)(
    'records %s as an incorrect answer for DNS Slime',
    (answer) => {
      const state = dnsSlimeBattle.submitCauseAnswer(
        dnsSlimeBattle.createInitialState(),
        answer,
      )

      expect(state).toMatchObject({
        causeAnswerAttempts: [{ answer, correct: false }],
        diagnosisStatus: 'INCORRECT',
        status: 'IN_PROGRESS',
      })
    },
  )

  it('records DNS as the correct answer without clearing before repair', () => {
    const state = dnsSlimeBattle.submitCauseAnswer(
      dnsSlimeBattle.createInitialState(),
      'DNS',
    )

    expect(state).toMatchObject({
      enemyHp: 100,
      causeAnswerAttempts: [{ answer: 'DNS', correct: true }],
      diagnosisStatus: 'CORRECT',
      status: 'IN_PROGRESS',
    })
    expect(Object.isFrozen(state)).toBe(true)
    expect(Object.isFrozen(state.causeAnswerAttempts)).toBe(true)
    expect(Object.isFrozen(state.causeAnswerAttempts[0])).toBe(true)
  })

  it('retains incorrect attempts when a later answer is correct', () => {
    const incorrectState = dnsSlimeBattle.submitCauseAnswer(
      dnsSlimeBattle.createInitialState(),
      'GATEWAY',
    )
    const correctState = dnsSlimeBattle.submitCauseAnswer(incorrectState, 'DNS')

    expect(correctState.causeAnswerAttempts).toEqual([
      { answer: 'GATEWAY', correct: false },
      { answer: 'DNS', correct: true },
    ])
    expect(correctState.diagnosisStatus).toBe('CORRECT')
    expect(incorrectState.causeAnswerAttempts).toEqual([
      { answer: 'GATEWAY', correct: false },
    ])
  })

  it('does not accept another answer after the correct cause is found', () => {
    const correctState = dnsSlimeBattle.submitCauseAnswer(
      dnsSlimeBattle.createInitialState(),
      'DNS',
    )

    expect(dnsSlimeBattle.submitCauseAnswer(correctState, 'FIREWALL')).toBe(
      correctState,
    )
  })
})
