import ipSlimeSource from './data/ip-slime.json?raw'
import { loadScenario } from './loadScenario'

const loadResult = loadScenario(ipSlimeSource)

if (!loadResult.success) {
  throw new Error(
    `Bundled IP Slime scenario is invalid: ${loadResult.error.code}`,
  )
}

export const IP_SLIME_SCENARIO = loadResult.scenario
export const IP_SLIME_CORRECT_ADDRESS = '192.168.1.10'
export const IP_SLIME_GATEWAY = '192.168.1.1'
