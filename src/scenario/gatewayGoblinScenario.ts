import gatewayGoblinSource from './data/gateway-goblin.json?raw'
import { loadScenario } from './loadScenario'

const loadResult = loadScenario(gatewayGoblinSource)

if (!loadResult.success) {
  throw new Error(
    `Bundled Gateway Goblin scenario is invalid: ${loadResult.error.code}`,
  )
}

export const GATEWAY_GOBLIN_SCENARIO = loadResult.scenario
export const GATEWAY_GOBLIN_EXTERNAL_IP = '203.0.113.20'
export const GATEWAY_GOBLIN_CORRECT_GATEWAY = '192.168.1.1'
