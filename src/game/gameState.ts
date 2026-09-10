import type { ScenarioId } from '../scenario/scenario'

export const GAME_SCREENS = [
  'MAP',
  'EVENT',
  'BATTLE',
  'RESULT',
  'LEARNING',
] as const

export type GameScreen = (typeof GAME_SCREENS)[number]

export type { ScenarioId } from '../scenario/scenario'

export interface PlayerState {
  readonly level: number
  readonly exp: number
  readonly completedScenarios: readonly ScenarioId[]
  readonly unlockedCommands: readonly string[]
}

export type BattleStatus = 'IN_PROGRESS' | 'CLEARED' | 'FAILED'

export interface BattleState {
  readonly scenarioId: ScenarioId
  readonly status: BattleStatus
}

export interface GameState {
  readonly currentScreen: GameScreen
  readonly currentScenario: ScenarioId | null
  readonly player: PlayerState
  readonly battleState: BattleState | null
}

export function createInitialGameState(): GameState {
  return {
    currentScreen: 'MAP',
    currentScenario: null,
    player: {
      level: 1,
      exp: 0,
      completedScenarios: [],
      unlockedCommands: [],
    },
    battleState: null,
  }
}

export const initialGameState = createInitialGameState()
