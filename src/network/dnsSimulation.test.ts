import { describe, expect, it } from 'vitest'
import type { NetworkState } from './networkState'
import { simulateNslookup } from './dnsSimulation'

const baseState: NetworkState = {
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

describe('simulateNslookup', () => {
  it('resolves a hostname using the configured, online DNS server', () => {
    expect(simulateNslookup(baseState, 'quest.example')).toEqual({
      resolved: true,
      server: '192.168.1.53',
      address: '203.0.113.20',
    })
  })

  it('treats DNS hostnames as case-insensitive and ignores a trailing dot', () => {
    expect(simulateNslookup(baseState, 'QUEST.EXAMPLE.')).toEqual({
      resolved: true,
      server: '192.168.1.53',
      address: '203.0.113.20',
    })
  })

  it('reports a missing client DNS setting', () => {
    const state = withClient(baseState, { dnsServers: [] })

    expect(simulateNslookup(state, 'quest.example')).toEqual({
      resolved: false,
      reason: 'DNS_NOT_CONFIGURED',
    })
  })

  it('reports a client DNS address absent from Scenario DNS servers', () => {
    const state = withClient(baseState, {
      dnsServers: ['192.168.1.99'],
    })

    expect(simulateNslookup(state, 'quest.example')).toEqual({
      resolved: false,
      reason: 'DNS_MISCONFIGURED',
      server: '192.168.1.99',
    })
  })

  it('reports an offline DNS server', () => {
    const state: NetworkState = {
      ...baseState,
      dns: {
        servers: [
          {
            ...baseState.dns.servers[0],
            online: false,
          },
        ],
      },
    }

    expect(simulateNslookup(state, 'quest.example')).toEqual({
      resolved: false,
      reason: 'SERVER_UNREACHABLE',
      server: '192.168.1.53',
    })
  })

  it('reports the DNS server as unreachable when the client link is down', () => {
    const state = withClient(baseState, { linkUp: false })

    expect(simulateNslookup(state, 'quest.example')).toEqual({
      resolved: false,
      reason: 'SERVER_UNREACHABLE',
      server: '192.168.1.53',
    })
  })

  it('reports a hostname absent from the selected server records', () => {
    expect(simulateNslookup(baseState, 'missing.example')).toEqual({
      resolved: false,
      reason: 'HOST_NOT_FOUND',
      server: '192.168.1.53',
    })
  })

  it('falls back to the next configured online DNS server', () => {
    const state: NetworkState = {
      ...baseState,
      client: {
        ...baseState.client,
        dnsServers: ['192.168.1.53', '192.168.1.54'],
      },
      dns: {
        servers: [
          { ...baseState.dns.servers[0], online: false },
          {
            ipAddress: '192.168.1.54',
            online: true,
            records: { 'quest.example': '203.0.113.20' },
          },
        ],
      },
    }

    expect(simulateNslookup(state, 'quest.example')).toEqual({
      resolved: true,
      server: '192.168.1.54',
      address: '203.0.113.20',
    })
  })

  it('returns the same result for the same Scenario State and hostname', () => {
    expect(simulateNslookup(baseState, 'quest.example')).toEqual(
      simulateNslookup(baseState, 'quest.example'),
    )
  })
})

function withClient(
  state: NetworkState,
  client: Partial<NetworkState['client']>,
): NetworkState {
  return {
    ...state,
    client: { ...state.client, ...client },
  }
}
