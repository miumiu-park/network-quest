import { describe, expect, it } from 'vitest'
import type { PlayerState } from '../game'
import { createProgressionState } from '../progression'
import { createInMemoryPlayerProgressRepository } from './inMemoryPlayerProgressRepository'
import type { PlayerProgressRepository } from './playerProgressRepository'

function createPlayer(exp = 100): PlayerState {
  return {
    ...createProgressionState(exp),
    completedScenarios: ['dns-slime'],
    unlockedCommands: ['ping', 'nslookup'],
  }
}

function saveAndLoad(
  repository: PlayerProgressRepository,
  player: PlayerState,
): PlayerState | null {
  expect(repository.save(player)).toBe(true)
  return repository.load()
}

describe('in-memory PlayerProgressRepository', () => {
  it('starts without saved progress', () => {
    expect(createInMemoryPlayerProgressRepository().load()).toBeNull()
  })

  it('implements the Repository interface without browser Storage', () => {
    const repository: PlayerProgressRepository =
      createInMemoryPlayerProgressRepository()

    expect(saveAndLoad(repository, createPlayer())).toEqual(createPlayer())
  })

  it('can be initialized with progress for a test', () => {
    const repository = createInMemoryPlayerProgressRepository(createPlayer(300))

    expect(repository.load()).toEqual({
      level: 3,
      exp: 300,
      nextLevelExp: 600,
      completedScenarios: ['dns-slime'],
      unlockedCommands: ['ping', 'nslookup'],
    })
  })

  it('stores snapshots independently from caller-owned arrays', () => {
    const completedScenarios = ['dns-slime']
    const unlockedCommands = ['ping']
    const repository = createInMemoryPlayerProgressRepository()

    repository.save({
      ...createProgressionState(100),
      completedScenarios,
      unlockedCommands,
    })
    completedScenarios.push('gateway-golem')
    unlockedCommands.push('nslookup')

    const restored = repository.load()
    expect(restored?.completedScenarios).toEqual(['dns-slime'])
    expect(restored?.unlockedCommands).toEqual(['ping'])
    expect(Object.isFrozen(restored)).toBe(true)
    expect(Object.isFrozen(restored?.completedScenarios)).toBe(true)
    expect(Object.isFrozen(restored?.unlockedCommands)).toBe(true)
  })

  it('keeps separate repositories isolated', () => {
    const first = createInMemoryPlayerProgressRepository()
    const second = createInMemoryPlayerProgressRepository()

    first.save(createPlayer())

    expect(first.load()).toEqual(createPlayer())
    expect(second.load()).toBeNull()
  })

  it('rejects inconsistent or duplicate progress data', () => {
    const repository = createInMemoryPlayerProgressRepository()

    expect(repository.save({ ...createPlayer(), level: 9 })).toBe(false)
    expect(
      repository.save({
        ...createPlayer(),
        unlockedCommands: ['ping', 'ping'],
      }),
    ).toBe(false)
    expect(repository.load()).toBeNull()
  })
})
