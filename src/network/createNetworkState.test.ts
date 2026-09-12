import { describe, expect, it } from 'vitest'
import type { Scenario } from '../scenario'
import { createNetworkState } from './createNetworkState'

const scenario: Scenario = {
  id: 'dns-slime',
  title: 'DNS Slimeの名前解決障害',
  event: {
    npcName: 'Net Sage',
    location: 'LAN Village',
    symptom: 'The village guide cannot open quest.example.',
  },
  enemy: { id: 'dns-slime', name: 'DNS Slime', maxHp: 100 },
  network: {
    client: {
      ipAddress: '192.168.1.10',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: ['192.168.1.99'],
      linkUp: true,
    },
    gateway: { ipAddress: '192.168.1.1', online: true },
    dns: {
      servers: [
        {
          ipAddress: '192.168.1.53',
          online: true,
          records: { 'quest.example': '203.0.113.20' },
        },
      ],
    },
    internet: {
      online: true,
      reachableAddresses: ['203.0.113.20'],
    },
  },
  failure: {
    type: 'DNS_MISCONFIGURATION',
    description: 'Hostname resolution fails',
  },
  answer: { cause: 'DNS' },
  reward: { exp: 100 },
  learning: {
    summary: 'IP reachability and name resolution are separate checks.',
    keyPoints: ['Verify gateway reachability before testing DNS.'],
  },
}

describe('createNetworkState', () => {
  it('constructs Client, Gateway, DNS and Internet state from a Scenario', () => {
    const result = createNetworkState(scenario)

    expect(result).toEqual({
      success: true,
      state: scenario.network,
    })
  })

  it('returns deeply frozen state that cannot be mutated by consumers', () => {
    const result = createNetworkState(scenario)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(Object.isFrozen(result.state)).toBe(true)
      expect(Object.isFrozen(result.state.client.dnsServers)).toBe(true)
      expect(Object.isFrozen(result.state.dns.servers)).toBe(true)
      expect(Object.isFrozen(result.state.dns.servers[0].records)).toBe(true)
      expect(Object.isFrozen(result.state.internet.reachableAddresses)).toBe(
        true,
      )
    }
  })

  it('rejects malformed Scenario network data with controlled issues', () => {
    const result = createNetworkState({
      network: {
        ...scenario.network,
        client: {
          ...(scenario.network.client as object),
          ipAddress: '999.168.1.10',
        },
        dns: { servers: [] },
      },
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe('Invalid network state in scenario')
      expect(result.error.issues.map((issue) => issue.path)).toEqual(
        expect.arrayContaining([
          'network.client.ipAddress',
          'network.dns.servers',
        ]),
      )
    }
  })

  it('rejects unknown fields instead of reading host environment data', () => {
    const result = createNetworkState({
      network: {
        ...scenario.network,
        hostInterface: 'Wi-Fi',
      },
    })

    expect(result.success).toBe(false)
  })

  it('builds equal state deterministically for the same Scenario', () => {
    expect(createNetworkState(scenario)).toEqual(createNetworkState(scenario))
  })
})
