import { describe, expect, it } from 'vitest'
import type { ScenarioProgressResult, StageResult } from '../game'
import { createInitialGameState } from '../game'
import { DNS_SLIME_SCENARIO, getScenarioGuide } from '../scenario'
import {
  createStageClearResult,
  matchesScenarioGuide,
} from './stageClearResultModel'

const stageResult: StageResult = {
  scenarioId: DNS_SLIME_SCENARIO.id,
  enemyName: DNS_SLIME_SCENARIO.enemy.name,
  exp: DNS_SLIME_SCENARIO.reward.exp,
  rank: 'A',
  performance: {
    commandCount: 6,
    incorrectAnswerCount: 0,
    hintCount: 1,
  },
}

describe('Stage Clear Result application model', () => {
  it('combines trusted Scenario Data with progression decided by the domain', () => {
    const guide = getScenarioGuide(stageResult.scenarioId)
    const initialPlayer = createInitialGameState().player
    const progress: ScenarioProgressResult = {
      player: { ...initialPlayer, level: 2, exp: 100, nextLevelExp: 300 },
      expAwarded: 100,
      isFirstClear: true,
      isNewBestRank: true,
      previousLevel: 1,
      currentLevel: 2,
    }

    expect(guide).toBeDefined()
    expect(createStageClearResult(stageResult, progress, guide!)).toMatchObject(
      {
        scenarioTitle: 'DNS Slimeの名前解決障害',
        enemyName: 'DNS Slime',
        rank: 'A',
        expAwarded: 100,
        previousLevel: 1,
        currentLevel: 2,
        didLevelUp: true,
        learningTheme: 'Name Resolution',
        keyCommands: ['ip', 'ping', 'nslookup'],
      },
    )
  })

  it('rejects route result metadata that does not match the catalog', () => {
    const guide = getScenarioGuide(stageResult.scenarioId)
    expect(guide).toBeDefined()

    expect(matchesScenarioGuide(stageResult, guide!)).toBe(true)
    expect(
      matchesScenarioGuide({ ...stageResult, enemyName: 'Fake Enemy' }, guide!),
    ).toBe(false)
    expect(matchesScenarioGuide({ ...stageResult, exp: 999 }, guide!)).toBe(
      false,
    )
  })
})
