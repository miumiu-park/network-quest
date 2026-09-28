import { describe, expect, it } from 'vitest'
import { createInitialGameState } from './gameState'
import { unlockAchievements, type AchievementId } from './achievement'
import type { StageResult } from './stageResult'

const scenarioIds = ['ip-slime', 'gateway-goblin', 'dns-slime', 'subnet-golem']

function createResult(
  overrides: Partial<StageResult['performance']> = {},
  rank: StageResult['rank'] = 'A',
): StageResult {
  return {
    scenarioId: 'dns-slime',
    enemyName: 'DNS Slime',
    exp: 100,
    rank,
    performance: {
      commandCount: 6,
      incorrectAnswerCount: 0,
      hintCount: 0,
      ...overrides,
    },
  }
}

describe('Achievements', () => {
  it('unlocks the first-clear, perfect, no-hint and efficient goals', () => {
    const player = {
      ...createInitialGameState().player,
      completedScenarios: ['dns-slime'],
    }

    expect(
      unlockAchievements(player, createResult(), scenarioIds).newlyUnlocked.map(
        (achievement) => achievement.id,
      ),
    ).toEqual([
      'first-troubleshooter',
      'perfect-diagnosis',
      'no-hint',
      'efficient-engineer',
    ])
  })

  it('uses the shared performance and rank values for conditions', () => {
    const player = {
      ...createInitialGameState().player,
      completedScenarios: ['dns-slime'],
    }
    const unlocked = unlockAchievements(
      player,
      createResult({ incorrectAnswerCount: 1, hintCount: 1 }, 'B'),
      scenarioIds,
    )

    expect(unlocked.newlyUnlocked.map((achievement) => achievement.id)).toEqual(
      ['first-troubleshooter'],
    )
  })

  it('unlocks LAN Master when every catalog scenario is complete', () => {
    const existing: AchievementId[] = [
      'first-troubleshooter',
      'perfect-diagnosis',
      'no-hint',
      'efficient-engineer',
    ]
    const player = {
      ...createInitialGameState().player,
      completedScenarios: scenarioIds,
      unlockedAchievements: existing,
    }

    expect(
      unlockAchievements(
        player,
        createResult({ incorrectAnswerCount: 1, hintCount: 1 }, 'B'),
        scenarioIds,
      ).newlyUnlocked.map((achievement) => achievement.id),
    ).toEqual(['lan-master'])
  })

  it('does not unlock the same Achievement twice', () => {
    const player = {
      ...createInitialGameState().player,
      completedScenarios: ['dns-slime'],
      unlockedAchievements: [
        'first-troubleshooter',
        'perfect-diagnosis',
        'no-hint',
        'efficient-engineer',
      ] as readonly AchievementId[],
    }
    const result = unlockAchievements(player, createResult(), scenarioIds)

    expect(result.newlyUnlocked).toEqual([])
    expect(result.player).toBe(player)
  })
})
