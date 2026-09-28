import { z } from 'zod'
import { ACHIEVEMENT_IDS, type PlayerState } from '../game'
import { createProgressionState, STAGE_RANKS } from '../progression'
import type { PlayerProgressRepository } from './playerProgressRepository'

export const PLAYER_PROGRESS_STORAGE_KEY = 'network-quest:player-progress'

const PLAYER_PROGRESS_VERSION = 3
const nonEmptyString = z.string().trim().min(1)
const nonNegativeSafeInteger = z
  .number()
  .int()
  .nonnegative()
  .refine(Number.isSafeInteger)
const uniqueStrings = z
  .array(nonEmptyString)
  .refine((values) => new Set(values).size === values.length)

const baseStoredPlayerProgressSchema = z.strictObject({
  level: z.number().int().positive().refine(Number.isSafeInteger),
  exp: nonNegativeSafeInteger,
  completedScenarios: z
    .array(nonEmptyString.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    .refine((values) => new Set(values).size === values.length),
  unlockedCommands: uniqueStrings,
})

const storedPlayerProgressV1Schema = baseStoredPlayerProgressSchema.extend({
  version: z.literal(1),
})

const storedPlayerProgressV2Schema = baseStoredPlayerProgressSchema.extend({
  version: z.literal(2),
  bestRanks: z.record(
    nonEmptyString.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    z.enum(STAGE_RANKS),
  ),
})

const storedPlayerProgressV3Schema = storedPlayerProgressV2Schema.extend({
  version: z.literal(PLAYER_PROGRESS_VERSION),
  unlockedAchievements: z
    .array(z.enum(ACHIEVEMENT_IDS))
    .refine((values) => new Set(values).size === values.length),
})

const storedPlayerProgressSchema = z.discriminatedUnion('version', [
  storedPlayerProgressV1Schema,
  storedPlayerProgressV2Schema,
  storedPlayerProgressV3Schema,
])

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
          bestRanks:
            result.data.version === 1
              ? Object.freeze({})
              : result.data.bestRanks,
          unlockedAchievements:
            result.data.version === 3
              ? result.data.unlockedAchievements
              : Object.freeze([]),
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
          bestRanks: player.bestRanks,
          unlockedAchievements: player.unlockedAchievements,
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
    bestRanks: Object.freeze({ ...player.bestRanks }),
    unlockedAchievements: Object.freeze([...player.unlockedAchievements]),
  })
}
