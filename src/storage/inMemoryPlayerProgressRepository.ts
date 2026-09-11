import type { PlayerState } from '../game'
import { createProgressionState } from '../progression'
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
    if (
      completedScenarios === null ||
      completedScenarios.some(
        (scenarioId) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenarioId),
      ) ||
      unlockedCommands === null
    ) {
      return null
    }

    return Object.freeze({
      ...progression,
      completedScenarios: Object.freeze(completedScenarios),
      unlockedCommands: Object.freeze(unlockedCommands),
    })
  } catch {
    return null
  }
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
