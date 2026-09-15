import { DNS_SLIME_SCENARIO } from './dnsSlimeScenario'
import { GATEWAY_GOBLIN_SCENARIO } from './gatewayGoblinScenario'
import { IP_SLIME_SCENARIO } from './ipSlimeScenario'
import type { Scenario, ScenarioId } from './scenario'
import { SUBNET_GOLEM_SCENARIO } from './subnetGolemScenario'

export type ScenarioDifficulty = '初級' | '中級' | '上級'

export interface ScenarioGuide {
  readonly scenario: Scenario
  readonly learningTheme: string
  readonly difficulty: ScenarioDifficulty
  readonly icon: string
  readonly encounter: 'BATTLE' | 'BOSS'
}

export const SCENARIO_GUIDES: readonly ScenarioGuide[] = Object.freeze([
  {
    scenario: IP_SLIME_SCENARIO,
    learningTheme: 'Host Addressing',
    difficulty: '初級',
    icon: '🟢',
    encounter: 'BATTLE',
  },
  {
    scenario: GATEWAY_GOBLIN_SCENARIO,
    learningTheme: 'Default Route',
    difficulty: '初級',
    icon: '👺',
    encounter: 'BATTLE',
  },
  {
    scenario: DNS_SLIME_SCENARIO,
    learningTheme: 'Name Resolution',
    difficulty: '中級',
    icon: '🦠',
    encounter: 'BATTLE',
  },
  {
    scenario: SUBNET_GOLEM_SCENARIO,
    learningTheme: 'Subnetting',
    difficulty: '上級',
    icon: '🗿',
    encounter: 'BOSS',
  },
])

export function getScenarioGuide(
  scenarioId: ScenarioId,
): ScenarioGuide | undefined {
  return SCENARIO_GUIDES.find((guide) => guide.scenario.id === scenarioId)
}

export function getNextRecommendedScenario(
  completedScenarios: readonly ScenarioId[],
): ScenarioGuide | null {
  return (
    SCENARIO_GUIDES.find(
      (guide) => !completedScenarios.includes(guide.scenario.id),
    ) ?? null
  )
}
