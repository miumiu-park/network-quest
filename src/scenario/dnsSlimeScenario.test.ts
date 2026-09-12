import { describe, expect, it } from 'vitest'
import { createNetworkState, simulateNslookup, simulatePing } from '../network'
import {
  DNS_SLIME_EXTERNAL_IP,
  DNS_SLIME_HOSTNAME,
  DNS_SLIME_SCENARIO,
} from './dnsSlimeScenario'

describe('DNS Slime scenario', () => {
  it('loads the bundled JSON through Scenario validation', () => {
    expect(DNS_SLIME_SCENARIO).toMatchObject({
      id: 'dns-slime',
      event: {
        npcName: 'Net Sage',
        location: 'LAN Village',
      },
      enemy: { name: 'DNS Slime', maxHp: 100 },
      failure: { type: 'DNS_MISCONFIGURATION' },
      answer: { cause: 'DNS' },
      reward: { exp: 100 },
    })
  })

  it('models gateway and external IP success with DNS failure', () => {
    const creation = createNetworkState(DNS_SLIME_SCENARIO)
    expect(creation.success).toBe(true)
    if (!creation.success) return

    expect(simulatePing(creation.state, 'gateway')).toMatchObject({
      reachable: true,
    })
    expect(simulatePing(creation.state, DNS_SLIME_EXTERNAL_IP)).toMatchObject({
      reachable: true,
    })
    expect(simulateNslookup(creation.state, DNS_SLIME_HOSTNAME)).toEqual({
      resolved: false,
      reason: 'DNS_MISCONFIGURED',
      server: '192.168.1.99',
    })
  })
})
