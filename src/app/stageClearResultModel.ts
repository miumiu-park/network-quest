import type {
  AchievementDefinition,
  ScenarioProgressResult,
  StageResult,
} from '../game'
import type { ScenarioGuide } from '../scenario'

export interface StageClearResult {
  readonly scenarioId: string
  readonly scenarioTitle: string
  readonly enemyName: string
  readonly rank: StageResult['rank']
  readonly performance: StageResult['performance']
  readonly expAwarded: number
  readonly rewardExp: number
  readonly isFirstClear: boolean
  readonly isNewBestRank: boolean
  readonly previousLevel: number
  readonly currentLevel: number
  readonly didLevelUp: boolean
  readonly learningTheme: string
  readonly learningSummary: string
  readonly learningKeyPoints: readonly string[]
  readonly keyCommands: readonly string[]
  readonly newAchievements: readonly AchievementDefinition[]
}

export function matchesScenarioGuide(
  result: StageResult,
  guide: ScenarioGuide,
): boolean {
  return (
    result.scenarioId === guide.scenario.id &&
    result.enemyName === guide.scenario.enemy.name &&
    result.exp === guide.scenario.reward.exp
  )
}

export function createStageClearResult(
  result: StageResult,
  progress: ScenarioProgressResult,
  guide: ScenarioGuide,
  newAchievements: readonly AchievementDefinition[] = [],
): StageClearResult {
  return Object.freeze({
    scenarioId: guide.scenario.id,
    scenarioTitle: guide.scenario.title,
    enemyName: guide.scenario.enemy.name,
    rank: result.rank,
    performance: result.performance,
    expAwarded: progress.expAwarded,
    rewardExp: guide.scenario.reward.exp,
    isFirstClear: progress.isFirstClear,
    isNewBestRank: progress.isNewBestRank,
    previousLevel: progress.previousLevel,
    currentLevel: progress.currentLevel,
    didLevelUp: progress.currentLevel > progress.previousLevel,
    learningTheme: guide.learningTheme,
    learningSummary: guide.scenario.learning.summary,
    learningKeyPoints: guide.scenario.learning.keyPoints,
    keyCommands: guide.keyCommands,
    newAchievements: Object.freeze([...newAchievements]),
  })
}
