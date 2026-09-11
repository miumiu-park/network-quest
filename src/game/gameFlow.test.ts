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
      reward: { exp: 100 },
    })
    expect(resultState).toMatchObject({
      currentScreen: 'RESULT',
      player: {
        exp: 100,
        level: 2,
        nextLevelExp: 300,
        completedScenarios: [DUMMY_SCENARIO_ID],
      },
      battleState: { status: 'CLEARED' },
    })

    const learningState = transitionGameState(resultState, {
      type: 'SHOW_LEARNING',
    })
    expect(learningState.currentScreen).toBe('LEARNING')

    const returnedState = transitionGameState(learningState, {
      type: 'RETURN_TO_MAP',
    })
    expect(returnedState).toMatchObject({
      currentScreen: 'MAP',
      currentScenario: null,
      player: resultState.player,
      battleState: null,
    })
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

  it('does not award EXP twice when a completed scenario is replayed', () => {
    const firstBattle = startBattle(createInitialGameState())
    const firstResult = transitionGameState(firstBattle, {
      type: 'COMPLETE_BATTLE',
      reward: { exp: 100 },
    })
    const learningState = transitionGameState(firstResult, {
      type: 'SHOW_LEARNING',
    })
    const mapState = transitionGameState(learningState, {
      type: 'RETURN_TO_MAP',
    })
    const replayBattle = startBattle(mapState)

    const replayResult = transitionGameState(replayBattle, {
      type: 'COMPLETE_BATTLE',
      reward: { exp: 100 },
    })

    expect(replayResult.player).toBe(replayBattle.player)
    expect(replayResult.player).toMatchObject({
      exp: 100,
      level: 2,
      nextLevelExp: 300,
      completedScenarios: [DUMMY_SCENARIO_ID],
    })
  })

  it('updates the level when a stage reward crosses multiple boundaries', () => {
    const battleState = startBattle(createInitialGameState())

    const resultState = transitionGameState(battleState, {
      type: 'COMPLETE_BATTLE',
      reward: { exp: 650 },
    })

    expect(resultState.player).toMatchObject({
      exp: 650,
      level: 4,
      nextLevelExp: 1000,
      completedScenarios: [DUMMY_SCENARIO_ID],
    })
  })
})

function startBattle(state: ReturnType<typeof createInitialGameState>) {
  const eventState = transitionGameState(state, {
    type: 'OPEN_EVENT',
    scenarioId: DUMMY_SCENARIO_ID,
  })

  return transitionGameState(eventState, { type: 'START_BATTLE' })
}
