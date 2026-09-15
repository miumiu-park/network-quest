import { describe, expect, it } from 'vitest'
import {
  SCENARIO_GUIDES,
  getNextRecommendedScenario,
  getScenarioGuide,
} from './scenarioCatalog'

describe('scenario catalog', () => {
  it('keeps the beginner recommendation order in one catalog', () => {
    expect(SCENARIO_GUIDES.map((guide) => guide.scenario.id)).toEqual([
      'ip-slime',
      'gateway-goblin',
      'dns-slime',
      'subnet-golem',
    ])
    expect(getScenarioGuide('subnet-golem')).toMatchObject({
      learningTheme: 'Subnetting',
      difficulty: '上級',
    })
  })

  it('recommends the first incomplete scenario without locking others', () => {
    expect(getNextRecommendedScenario([])?.scenario.id).toBe('ip-slime')
    expect(getNextRecommendedScenario(['ip-slime'])?.scenario.id).toBe(
      'gateway-goblin',
    )
    expect(
      getNextRecommendedScenario([
        'ip-slime',
        'gateway-goblin',
        'dns-slime',
        'subnet-golem',
      ]),
    ).toBeNull()
  })
})
