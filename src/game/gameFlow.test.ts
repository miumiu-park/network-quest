import { describe, expect, it } from 'vitest'
import { InvalidGameTransitionError, transitionGameState } from './gameFlow'
import { createInitialGameState } from './gameState'

const DUMMY_SCENARIO_ID = 'dns-slime'

describe('transitionGameState', () => {
  it('runs the complete basic game flow with a scenario', () => {
    const initialState = createInitialGameState()

    const eventState = transitionGameState(initialState, {
      type: 'OPEN_EVENT',
      scenarioId: DUMMY_SCENARIO_ID,
    })
    expect(eventState).toMatchObject({
      currentScreen: 'EVENT',
      currentScenario: DUMMY_SCENARIO_ID,
      battleState: null,
    })

    const battleState = transitionGameState(eventState, {
      type: 'START_BATTLE',
    })
    expect(battleState).toMatchObject({
      currentScreen: 'BATTLE',
      currentScenario: DUMMY_SCENARIO_ID,
      battleState: {
        scenarioId: DUMMY_SCENARIO_ID,
        status: 'IN_PROGRESS',
      },
    })

    const resultState = transitionGameState(battleState, {
      type: 'COMPLETE_BATTLE',
    })
    expect(resultState).toMatchObject({
      currentScreen: 'RESULT',
      battleState: { status: 'CLEARED' },
    })

    const learningState = transitionGameState(resultState, {
      type: 'SHOW_LEARNING',
    })
    expect(learningState.currentScreen).toBe('LEARNING')

    const returnedState = transitionGameState(learningState, {
      type: 'RETURN_TO_MAP',
    })
    expect(returnedState).toEqual(initialState)
  })

  it('does not mutate the previous state', () => {
    const initialState = createInitialGameState()

    transitionGameState(initialState, {
      type: 'OPEN_EVENT',
      scenarioId: DUMMY_SCENARIO_ID,
    })

    expect(initialState).toEqual(createInitialGameState())
  })

  it('rejects actions that skip a screen in the flow', () => {
    const initialState = createInitialGameState()

    expect(() =>
      transitionGameState(initialState, { type: 'START_BATTLE' }),
    ).toThrow(
      new InvalidGameTransitionError(
        initialState.currentScreen,
        'START_BATTLE',
      ),
    )
  })
})
