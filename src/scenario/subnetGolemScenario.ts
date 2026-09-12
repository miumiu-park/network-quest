import scenarioJson from './data/subnet-golem.json?raw'
import { loadScenario } from './loadScenario'

const loadResult = loadScenario(scenarioJson)

if (!loadResult.success) {
  throw new Error('Bundled Subnet Golem scenario failed validation')
}

export const SUBNET_GOLEM_SCENARIO = loadResult.scenario
export const SUBNET_GOLEM_CORRECT_MASK = '255.255.255.0'
export const SUBNET_GOLEM_PEER_ADDRESSES = Object.freeze([
  '192.168.1.20',
  '192.168.1.130',
] as const)
