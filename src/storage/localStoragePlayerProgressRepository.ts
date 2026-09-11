import { z } from 'zod'
import type { PlayerState } from '../game'
import { createProgressionState } from '../progression'
import type { PlayerProgressRepository } from './playerProgressRepository'

export const PLAYER_PROGRESS_STORAGE_KEY = 'network-quest:player-progress'

const PLAYER_PROGRESS_VERSION = 1
const nonEmptyString = z.string().trim().min(1)
const nonNegativeSafeInteger = z
  .number()
  .int()
  .nonnegative()
  .refine(Number.isSafeInteger)
const uniqueStrings = z
  .array(nonEmptyString)
  .refine((values) => new Set(values).size === values.length)

const storedPlayerProgressSchema = z.strictObject({
  version: z.literal(PLAYER_PROGRESS_VERSION),
  level: z.number().int().positive().refine(Number.isSafeInteger),
  exp: nonNegativeSafeInteger,
  completedScenarios: z
    .array(nonEmptyString.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    .refine((values) => new Set(values).size === values.length),
  unlockedCommands: uniqueStrings,
})

export interface PlayerProgressStorage {
  readonly getItem: (key: string) => string | null
  readonly setItem: (key: string, value: string) => void
}

export function createLocalStoragePlayerProgressRepository(
  storage: PlayerProgressStorage = window.localStorage,
): PlayerProgressRepository {
  return Object.freeze({
    load() {
      try {
        const serialized = storage.getItem(PLAYER_PROGRESS_STORAGE_KEY)
        if (serialized === null) return null

        const result = storedPlayerProgressSchema.safeParse(
          JSON.parse(serialized) as unknown,
        )
        if (!result.success) return null

        const progression = createProgressionState(result.data.exp)
        if (progression.level !== result.data.level) return null

        return freezePlayerState({
          ...progression,
          completedScenarios: result.data.completedScenarios,
          unlockedCommands: result.data.unlockedCommands,
        })
      } catch {
        return null
      }
    },
    save(player: PlayerState) {
      try {
        const progression = createProgressionState(player.exp)
        if (
          progression.level !== player.level ||
          progression.nextLevelExp !== player.nextLevelExp
        ) {
          return false
        }

        const result = storedPlayerProgressSchema.safeParse({
          version: PLAYER_PROGRESS_VERSION,
          level: player.level,
          exp: player.exp,
          completedScenarios: player.completedScenarios,
          unlockedCommands: player.unlockedCommands,
        })
        if (!result.success) return false

        storage.setItem(
          PLAYER_PROGRESS_STORAGE_KEY,
          JSON.stringify(result.data),
        )
        return true
      } catch {
        return false
      }
    },
  })
}

function freezePlayerState(player: PlayerState): PlayerState {
  return Object.freeze({
    ...player,
    completedScenarios: Object.freeze([...player.completedScenarios]),
    unlockedCommands: Object.freeze([...player.unlockedCommands]),
  })
}
