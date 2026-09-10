import type { GameScreen, GameState, ScenarioId } from './gameState'

export type GameAction =
  | { readonly type: 'OPEN_EVENT'; readonly scenarioId: ScenarioId }
  | { readonly type: 'START_BATTLE' }
  | { readonly type: 'COMPLETE_BATTLE' }
  | { readonly type: 'SHOW_LEARNING' }
  | { readonly type: 'RETURN_TO_MAP' }

export class InvalidGameTransitionError extends Error {
  constructor(currentScreen: GameScreen, action: GameAction['type']) {
    super(`Cannot perform ${action} from ${currentScreen}`)
    this.name = 'InvalidGameTransitionError'
  }
}

function requireScreen(
  state: GameState,
  expectedScreen: GameScreen,
  action: GameAction['type'],
): void {
  if (state.currentScreen !== expectedScreen) {
    throw new InvalidGameTransitionError(state.currentScreen, action)
  }
}

export function transitionGameState(
  state: GameState,
  action: GameAction,
): GameState {
  switch (action.type) {
    case 'OPEN_EVENT':
      requireScreen(state, 'MAP', action.type)
      return {
        ...state,
        currentScreen: 'EVENT',
        currentScenario: action.scenarioId,
        battleState: null,
      }

    case 'START_BATTLE': {
      requireScreen(state, 'EVENT', action.type)

      if (state.currentScenario === null) {
        throw new InvalidGameTransitionError(state.currentScreen, action.type)
      }

      return {
        ...state,
        currentScreen: 'BATTLE',
        battleState: {
          scenarioId: state.currentScenario,
          status: 'IN_PROGRESS',
        },
      }
    }

    case 'COMPLETE_BATTLE': {
      requireScreen(state, 'BATTLE', action.type)

      if (state.battleState === null) {
        throw new InvalidGameTransitionError(state.currentScreen, action.type)
      }

      return {
        ...state,
        currentScreen: 'RESULT',
        battleState: {
          ...state.battleState,
          status: 'CLEARED',
        },
      }
    }

    case 'SHOW_LEARNING':
      requireScreen(state, 'RESULT', action.type)
      return {
        ...state,
        currentScreen: 'LEARNING',
      }

    case 'RETURN_TO_MAP':
      requireScreen(state, 'LEARNING', action.type)
      return {
        ...state,
        currentScreen: 'MAP',
        currentScenario: null,
        battleState: null,
      }
  }
}
