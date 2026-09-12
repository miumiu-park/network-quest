export type ScenarioId = string

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue }

export interface ScenarioEnemy {
  readonly id: string
  readonly name: string
  readonly maxHp: number
}

export interface ScenarioEvent {
  readonly npcName: string
  readonly location: string
  readonly symptom: string
}

export interface ScenarioTopologyNode {
  readonly id: string
  readonly name: string
  readonly detail: string
}

export interface ScenarioTopology {
  readonly mainPath: readonly ScenarioTopologyNode[]
  readonly dnsNode: ScenarioTopologyNode
  readonly dnsConnectionLabel: string
}

export type ScenarioNetwork = Readonly<Record<string, JsonValue>>

export interface ScenarioFailure {
  readonly type: string
  readonly description: string
}

export interface ScenarioAnswer {
  readonly cause: string
}

export interface ScenarioReward {
  readonly exp: number
}

export interface ScenarioLearning {
  readonly summary: string
  readonly keyPoints: readonly string[]
}

export interface Scenario {
  readonly id: ScenarioId
  readonly title: string
  readonly event: ScenarioEvent
  readonly topology: ScenarioTopology
  readonly enemy: ScenarioEnemy
  readonly network: ScenarioNetwork
  readonly failure: ScenarioFailure
  readonly answer: ScenarioAnswer
  readonly reward: ScenarioReward
  readonly learning: ScenarioLearning
}
