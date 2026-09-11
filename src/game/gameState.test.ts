import { describe, expect, it } from 'vitest'
import {
  GAME_SCREENS,
  createInitialGameState,
  initialGameState,
} from './gameState'

describe('GameState', () => {
  it('defines every screen in the basic game flow', () => {
    expect(GAME_SCREENS).toEqual([
      'MAP',
      'EVENT',
      'BATTLE',
      'RESULT',
      'LEARNING',
    ])
  })

  it('starts on the map without an active scenario or battle', () => {
    expect(initialGameState).toEqual({
      currentScreen: 'MAP',
      currentScenario: null,
      player: {
        level: 1,
        exp: 0,
        nextLevelExp: 100,
        completedScenarios: [],
        unlockedCommands: [],
      },
      battleState: null,
    })
  })

  it('creates independent state for each game session', () => {
    const firstState = createInitialGameState()
    const secondState = createInitialGameState()

    expect(firstState).not.toBe(secondState)
    expect(firstState.player).not.toBe(secondState.player)
    expect(firstState.player.completedScenarios).not.toBe(
      secondState.player.completedScenarios,
    )
    expect(firstState.player.unlockedCommands).not.toBe(
      secondState.player.unlockedCommands,
    )
  })
})
