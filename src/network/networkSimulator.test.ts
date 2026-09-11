import { describe, expect, it, vi } from 'vitest'
import type { NetworkState } from './networkState'
import {
  createNetworkSimulator,
  type NetworkSimulationRules,
} from './networkSimulator'

const state: NetworkState = {
  client: {
    ipAddress: '192.168.1.10',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServers: ['192.168.1.53'],
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
}

function createRules(): NetworkSimulationRules {
  return {
    simulatePing: vi.fn((networkState, target) => ({
      reachable: true as const,
      address: target === 'gateway' ? networkState.gateway.ipAddress : target,
      roundTripTimeMs: 5,
    })),
    simulateNslookup: vi.fn((networkState, hostname) => ({
      resolved: true as const,
      server: networkState.dns.servers[0].ipAddress,
      address: networkState.dns.servers[0].records[hostname],
    })),
  }
}

describe('createNetworkSimulator', () => {
  it('binds simulatePing to the validated Scenario State', () => {
    const rules = createRules()
    const simulator = createNetworkSimulator(state, rules)

    expect(simulator.simulatePing('gateway')).toEqual({
      reachable: true,
      address: '192.168.1.1',
      roundTripTimeMs: 5,
    })
    expect(rules.simulatePing).toHaveBeenCalledWith(state, 'gateway')
  })

  it('binds simulateNslookup to the validated Scenario State', () => {
    const rules = createRules()
    const simulator = createNetworkSimulator(state, rules)

    expect(simulator.simulateNslookup('quest.example')).toEqual({
      resolved: true,
      server: '192.168.1.53',
      address: '203.0.113.20',
    })
    expect(rules.simulateNslookup).toHaveBeenCalledWith(state, 'quest.example')
  })

  it('returns a detached, immutable view of client interface information', () => {
    const simulator = createNetworkSimulator(state, createRules())
    const info = simulator.getInterfaceInfo()

    expect(info).toEqual({
      ipAddress: '192.168.1.10',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: ['192.168.1.53'],
    })
    expect(info.dnsServers).not.toBe(state.client.dnsServers)
    expect(Object.isFrozen(info)).toBe(true)
    expect(Object.isFrozen(info.dnsServers)).toBe(true)
  })

  it('returns equal results for repeated calls with the same state and input', () => {
    const simulator = createNetworkSimulator(state, createRules())

    expect(simulator.simulatePing('gateway')).toEqual(
      simulator.simulatePing('gateway'),
    )
    expect(simulator.simulateNslookup('quest.example')).toEqual(
      simulator.simulateNslookup('quest.example'),
    )
    expect(simulator.getInterfaceInfo()).toEqual(simulator.getInterfaceInfo())
  })
})
