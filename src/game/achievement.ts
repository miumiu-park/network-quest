import type { PlayerState } from './gameState'
import type { StageResult } from './stageResult'

export const ACHIEVEMENT_IDS = [
  'first-troubleshooter',
  'perfect-diagnosis',
  'no-hint',
  'efficient-engineer',
  'lan-master',
] as const

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number]

export interface AchievementDefinition {
  readonly id: AchievementId
  readonly name: string
  readonly description: string
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = Object.freeze([
  Object.freeze({
    id: 'first-troubleshooter',
    name: 'First Troubleshooter',
    description: '初めてScenarioをクリアする。',
  }),
  Object.freeze({
    id: 'perfect-diagnosis',
    name: 'Perfect Diagnosis',
    description: '原因回答を一度も間違えずにクリアする。',
  }),
  Object.freeze({
    id: 'no-hint',
    name: 'No Hint',
    description: 'Hintを使わずにクリアする。',
  }),
  Object.freeze({
    id: 'efficient-engineer',
    name: 'Efficient Engineer',
    description: 'Stage Rank A以上でクリアする。',
  }),
  Object.freeze({
    id: 'lan-master',
    name: 'LAN Master',
    description: 'LAN Villageの全Scenarioをクリアする。',
  }),
])

export interface AchievementUnlockResult {
  readonly player: PlayerState
  readonly newlyUnlocked: readonly AchievementDefinition[]
}

export function unlockAchievements(
  player: PlayerState,
  result: StageResult,
  scenarioIds: readonly string[],
): AchievementUnlockResult {
  const eligible = new Set<AchievementId>()
  if (player.completedScenarios.length > 0) eligible.add('first-troubleshooter')
  if (result.performance.incorrectAnswerCount === 0) {
    eligible.add('perfect-diagnosis')
  }
  if (result.performance.hintCount === 0) eligible.add('no-hint')
  if (result.rank === 'S' || result.rank === 'A') {
    eligible.add('efficient-engineer')
  }
  if (
    scenarioIds.length > 0 &&
    scenarioIds.every((scenarioId) =>
      player.completedScenarios.includes(scenarioId),
    )
  ) {
    eligible.add('lan-master')
  }

  const existing = new Set(player.unlockedAchievements)
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (achievement) =>
      eligible.has(achievement.id) && !existing.has(achievement.id),
  )
  if (newlyUnlocked.length === 0) {
    return Object.freeze({ player, newlyUnlocked: Object.freeze([]) })
  }

  return Object.freeze({
    player: Object.freeze({
      ...player,
      unlockedAchievements: Object.freeze([
        ...player.unlockedAchievements,
        ...newlyUnlocked.map((achievement) => achievement.id),
      ]),
    }),
    newlyUnlocked: Object.freeze(newlyUnlocked),
  })
}
