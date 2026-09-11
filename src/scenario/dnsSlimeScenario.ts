import dnsSlimeSource from './data/dns-slime.json?raw'
import { loadScenario } from './loadScenario'

const loadResult = loadScenario(dnsSlimeSource)

if (!loadResult.success) {
  throw new Error(
    `Bundled DNS Slime scenario is invalid: ${loadResult.error.code}`,
  )
}

export const DNS_SLIME_SCENARIO = loadResult.scenario
export const DNS_SLIME_HOSTNAME = 'quest.example'
export const DNS_SLIME_EXTERNAL_IP = '203.0.113.20'
export const DNS_SLIME_CORRECT_DNS = '192.168.1.53'
