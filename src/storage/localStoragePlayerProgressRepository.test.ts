import { describe, expect, it } from 'vitest'
import type { PlayerState } from '../game'
import { createProgressionState } from '../progression'
import {
  createLocalStoragePlayerProgressRepository,
  PLAYER_PROGRESS_STORAGE_KEY,
  type PlayerProgressStorage,
} from './localStoragePlayerProgressRepository'

class MemoryStorage implements PlayerProgressStorage {
  readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

function createPlayer(exp = 100): PlayerState {
  return {
    ...createProgressionState(exp),
    completedScenarios: ['dns-slime'],
    unlockedCommands: ['ping', 'nslookup'],
  }
}

describe('LocalStorage PlayerProgressRepository', () => {
  it('saves only the versioned Player Progress fields', () => {
    const storage = new MemoryStorage()
    const repository = createLocalStoragePlayerProgressRepository(storage)

    expect(repository.save(createPlayer())).toBe(true)
    expect(
      JSON.parse(storage.getItem(PLAYER_PROGRESS_STORAGE_KEY) ?? ''),
    ).toEqual({
      version: 1,
      level: 2,
      exp: 100,
      completedScenarios: ['dns-slime'],
      unlockedCommands: ['ping', 'nslookup'],
    })
  })

  it('restores progress after a new repository instance is created', () => {
    const storage = new MemoryStorage()
    const firstRepository = createLocalStoragePlayerProgressRepository(storage)
    const player = createPlayer(300)
    firstRepository.save(player)

    const reloadedRepository =
      createLocalStoragePlayerProgressRepository(storage)
    const restored = reloadedRepository.load()

    expect(restored).toEqual({
      level: 3,
      exp: 300,
      nextLevelExp: 600,
      completedScenarios: ['dns-slime'],
      unlockedCommands: ['ping', 'nslookup'],
    })
    expect(Object.isFrozen(restored)).toBe(true)
    expect(Object.isFrozen(restored?.completedScenarios)).toBe(true)
    expect(Object.isFrozen(restored?.unlockedCommands)).toBe(true)
  })

  it('returns null when no progress has been saved', () => {
    const repository = createLocalStoragePlayerProgressRepository(
      new MemoryStorage(),
    )

    expect(repository.load()).toBeNull()
  })

  it.each([
    'not-json',
    JSON.stringify({
      version: 2,
      level: 2,
      exp: 100,
      completedScenarios: ['dns-slime'],
      unlockedCommands: ['ping'],
    }),
    JSON.stringify({
      version: 1,
      level: 99,
      exp: 100,
      completedScenarios: ['dns-slime'],
      unlockedCommands: ['ping'],
    }),
    JSON.stringify({
      version: 1,
      level: 2,
      exp: 100,
      completedScenarios: ['DNS Slime'],
      unlockedCommands: ['ping'],
    }),
    JSON.stringify({
      version: 1,
      level: 2,
      exp: 100,
      completedScenarios: ['dns-slime', 'dns-slime'],
      unlockedCommands: ['ping'],
    }),
  ])('returns null for corrupted persisted data %#', (serialized) => {
    const storage = new MemoryStorage()
    storage.setItem(PLAYER_PROGRESS_STORAGE_KEY, serialized)

    expect(
      createLocalStoragePlayerProgressRepository(storage).load(),
    ).toBeNull()
  })

  it('returns null when reading LocalStorage throws', () => {
    const storage: PlayerProgressStorage = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {},
    }

    expect(
      createLocalStoragePlayerProgressRepository(storage).load(),
    ).toBeNull()
  })

  it('returns false when writing LocalStorage throws', () => {
    const storage: PlayerProgressStorage = {
      getItem() {
        return null
      },
      setItem() {
        throw new Error('quota exceeded')
      },
    }

    expect(
      createLocalStoragePlayerProgressRepository(storage).save(createPlayer()),
    ).toBe(false)
  })

  it('does not save inconsistent progression values', () => {
    const storage = new MemoryStorage()
    const repository = createLocalStoragePlayerProgressRepository(storage)

    expect(repository.save({ ...createPlayer(), level: 9 })).toBe(false)
    expect(storage.getItem(PLAYER_PROGRESS_STORAGE_KEY)).toBeNull()
  })
})
