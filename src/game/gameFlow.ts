import {
  addExperience,
  isStageRankBetter,
  type StageRank,
} from '../progression'
import type { ScenarioReward } from '../scenario'
import type {
  GameScreen,
  GameState,
  PlayerState,
  ScenarioId,
} from './gameState'

export type GameAction =
  | { readonly type: 'OPEN_EVENT'; readonly scenarioId: ScenarioId }
  | { readonly type: 'START_BATTLE' }
  | { readonly type: 'COMPLETE_BATTLE'; readonly reward: ScenarioReward }
  | { readonly type: 'SHOW_LEARNING' }
  | { readonly type: 'RETURN_TO_MAP' }

export class InvalidGameTransitionError extends Error {
  constructor(currentScreen: GameScreen, action: GameAction['type']) {
    super(`Cannot perform ${action} from ${currentScreen}`)
    this.name = 'InvalidGameTransitionError'
  }
}

export function completeScenarioProgress(
  player: PlayerState,
  scenarioId: ScenarioId,
  reward: ScenarioReward,
): PlayerState {
  return recordScenarioProgress(player, scenarioId, reward).player
}

export interface ScenarioProgressResult {
  readonly player: PlayerState
  readonly expAwarded: number
  readonly isNewBestRank: boolean
}

export function recordScenarioProgress(
  player: PlayerState,
  scenarioId: ScenarioId,
  reward: ScenarioReward,
  rank?: StageRank,
): ScenarioProgressResult {
  const isFirstClear = !player.completedScenarios.includes(scenarioId)
  const currentBestRank = player.bestRanks[scenarioId]
  const isNewBestRank =
    rank !== undefined &&
    (currentBestRank === undefined || isStageRankBetter(rank, currentBestRank))

  if (!isFirstClear && !isNewBestRank) {
    return Object.freeze({ player, expAwarded: 0, isNewBestRank: false })
  }

  const progression = isFirstClear ? addExperience(player, reward.exp) : player

  const nextPlayer = Object.freeze({
    ...player,
    ...progression,
    completedScenarios: isFirstClear
      ? Object.freeze([...player.completedScenarios, scenarioId])
      : player.completedScenarios,
    bestRanks: isNewBestRank
      ? Object.freeze({ ...player.bestRanks, [scenarioId]: rank })
      : player.bestRanks,
  })

  return Object.freeze({
    player: nextPlayer,
    expAwarded: isFirstClear ? reward.exp : 0,
    isNewBestRank,
  })
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

      const scenarioId = state.battleState.scenarioId
      const player = completeScenarioProgress(
        state.player,
        scenarioId,
        action.reward,
      )

      return {
        ...state,
        currentScreen: 'RESULT',
        player,
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
