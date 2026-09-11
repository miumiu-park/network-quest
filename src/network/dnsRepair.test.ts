import { describe, expect, it } from 'vitest'
import { simulateNslookup } from './dnsSimulation'
import { repairDnsConfiguration } from './dnsRepair'
import type { NetworkState } from './networkState'

const dnsSlimeState: NetworkState = {
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
}

describe('repairDnsConfiguration', () => {
  it('replaces DNS Slime incorrect DNS setting in virtual Network State', () => {
    expect(simulateNslookup(dnsSlimeState, 'quest.example')).toMatchObject({
      resolved: false,
      reason: 'DNS_MISCONFIGURED',
    })

    const result = repairDnsConfiguration(dnsSlimeState, '192.168.1.53')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.changed).toBe(true)
      expect(result.state.client.dnsServers).toEqual(['192.168.1.53'])
      expect(simulateNslookup(result.state, 'quest.example')).toEqual({
        resolved: true,
        server: '192.168.1.53',
        address: '203.0.113.20',
      })
    }
  })

  it('does not mutate the original Scenario-derived State', () => {
    const result = repairDnsConfiguration(dnsSlimeState, '192.168.1.53')

    expect(dnsSlimeState.client.dnsServers).toEqual(['192.168.1.99'])
    expect(result.state).not.toBe(dnsSlimeState)
    expect(result.state.gateway).not.toBe(dnsSlimeState.gateway)
    expect(result.state.dns).not.toBe(dnsSlimeState.dns)
    expect(result.state.internet).not.toBe(dnsSlimeState.internet)
  })

  it('returns a deeply immutable repaired State', () => {
    const result = repairDnsConfiguration(dnsSlimeState, '192.168.1.53')

    expect(result.success).toBe(true)
    expect(Object.isFrozen(result.state)).toBe(true)
    expect(Object.isFrozen(result.state.client)).toBe(true)
    expect(Object.isFrozen(result.state.client.dnsServers)).toBe(true)
    expect(Object.isFrozen(result.state.dns.servers)).toBe(true)
    expect(Object.isFrozen(result.state.dns.servers[0].records)).toBe(true)
  })

  it('rejects a DNS server absent from Scenario State', () => {
    const result = repairDnsConfiguration(dnsSlimeState, '8.8.8.8')

    expect(result).toEqual({
      success: false,
      state: dnsSlimeState,
      error: { code: 'DNS_SERVER_NOT_FOUND', server: '8.8.8.8' },
    })
  })

  it('rejects an offline Scenario DNS server', () => {
    const state: NetworkState = {
      ...dnsSlimeState,
      dns: {
        servers: [{ ...dnsSlimeState.dns.servers[0], online: false }],
      },
    }

    expect(repairDnsConfiguration(state, '192.168.1.53')).toEqual({
      success: false,
      state,
      error: { code: 'DNS_SERVER_OFFLINE', server: '192.168.1.53' },
    })
  })

  it('is idempotent when the correct virtual DNS is already configured', () => {
    const firstResult = repairDnsConfiguration(dnsSlimeState, '192.168.1.53')
    expect(firstResult.success).toBe(true)

    const secondResult = repairDnsConfiguration(
      firstResult.state,
      '192.168.1.53',
    )

    expect(secondResult).toEqual({
      success: true,
      state: firstResult.state,
      changed: false,
    })
  })
})
