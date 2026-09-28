import { ACHIEVEMENT_IDS, type PlayerState } from '../game'
import { createProgressionState, STAGE_RANKS } from '../progression'
import type { PlayerProgressRepository } from './playerProgressRepository'

export function createInMemoryPlayerProgressRepository(
  initialPlayer: PlayerState | null = null,
): PlayerProgressRepository {
  let storedPlayer =
    initialPlayer === null ? null : createPlayerSnapshot(initialPlayer)

  return Object.freeze({
    load() {
      return storedPlayer === null ? null : createPlayerSnapshot(storedPlayer)
    },
    save(player: PlayerState) {
      const snapshot = createPlayerSnapshot(player)
      if (snapshot === null) return false

      storedPlayer = snapshot
      return true
    },
  })
}

function createPlayerSnapshot(player: PlayerState): PlayerState | null {
  try {
    const progression = createProgressionState(player.exp)
    if (
      progression.level !== player.level ||
      progression.nextLevelExp !== player.nextLevelExp
    ) {
      return null
    }

    const completedScenarios = normalizeUniqueStrings(player.completedScenarios)
    const unlockedCommands = normalizeUniqueStrings(player.unlockedCommands)
    const bestRanks = normalizeBestRanks(player.bestRanks)
    const unlockedAchievements = normalizeUniqueStrings(
      player.unlockedAchievements,
    )
    if (
      completedScenarios === null ||
      completedScenarios.some(
        (scenarioId) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenarioId),
      ) ||
      unlockedCommands === null ||
      bestRanks === null ||
      unlockedAchievements === null ||
      unlockedAchievements.some(
        (id) => !ACHIEVEMENT_IDS.some((achievementId) => achievementId === id),
      )
    ) {
      return null
    }

    return Object.freeze({
      ...progression,
      completedScenarios: Object.freeze(completedScenarios),
      unlockedCommands: Object.freeze(unlockedCommands),
      bestRanks: Object.freeze(bestRanks),
      unlockedAchievements: Object.freeze(
        unlockedAchievements as PlayerState['unlockedAchievements'],
      ),
    })
  } catch {
    return null
  }
}

function normalizeBestRanks(
  bestRanks: PlayerState['bestRanks'],
): Partial<Record<string, (typeof STAGE_RANKS)[number]>> | null {
  if (typeof bestRanks !== 'object' || bestRanks === null) return null

  const entries = Object.entries(bestRanks)
  if (
    entries.some(
      ([scenarioId, rank]) =>
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenarioId) ||
        !STAGE_RANKS.some((stageRank) => stageRank === rank),
    )
  ) {
    return null
  }

  return Object.fromEntries(entries)
}

function normalizeUniqueStrings(
  values: readonly string[],
): readonly string[] | null {
  if (!Array.isArray(values)) return null

  const normalized = values.map((value) => value.trim())
  if (
    normalized.some((value) => value.length === 0) ||
    new Set(normalized).size !== normalized.length
  ) {
    return null
  }

  return normalized
}
