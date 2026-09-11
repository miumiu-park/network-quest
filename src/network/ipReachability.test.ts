import { describe, expect, it } from 'vitest'
import type { NetworkState } from './networkState'
import { createNetworkSimulator } from './networkSimulator'
import { simulatePing } from './ipReachability'

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

describe('simulatePing', () => {
  it.each(['client', '192.168.1.10'])(
    'reaches the client through target %s when its link is up',
    (target) => {
      expect(simulatePing(baseState, target)).toEqual({
        reachable: true,
        address: '192.168.1.10',
        roundTripTimeMs: 0,
      })
    },
  )

  it('cannot reach the client when its link is down', () => {
    const state = withClient(baseState, { linkUp: false })

    expect(simulatePing(state, 'client')).toEqual({
      reachable: false,
      reason: 'UNREACHABLE',
    })
  })

  it.each(['gateway', '192.168.1.1'])(
    'reaches the gateway through target %s when the local path is healthy',
    (target) => {
      expect(simulatePing(baseState, target)).toEqual({
        reachable: true,
        address: '192.168.1.1',
        roundTripTimeMs: 1,
      })
    },
  )

  it('cannot reach an offline gateway', () => {
    const state: NetworkState = {
      ...baseState,
      gateway: { ...baseState.gateway, online: false },
    }

    expect(simulatePing(state, 'gateway')).toEqual({
      reachable: false,
      reason: 'UNREACHABLE',
    })
  })

  it('cannot reach a gateway outside the client subnet', () => {
    const state: NetworkState = {
      ...baseState,
      gateway: { ...baseState.gateway, ipAddress: '192.168.2.1' },
    }

    expect(simulatePing(state, 'gateway')).toEqual({
      reachable: false,
      reason: 'UNREACHABLE',
    })
  })

  it('reaches a Scenario-listed external IP through a healthy route', () => {
    expect(simulatePing(baseState, '203.0.113.20')).toEqual({
      reachable: true,
      address: '203.0.113.20',
      roundTripTimeMs: 12,
    })
  })

  it.each([
    ['client link down', withClient(baseState, { linkUp: false })],
    [
      'wrong default gateway',
      withClient(baseState, { gateway: '192.168.1.254' }),
    ],
    [
      'gateway offline',
      {
        ...baseState,
        gateway: { ...baseState.gateway, online: false },
      },
    ],
    [
      'internet offline',
      {
        ...baseState,
        internet: { ...baseState.internet, online: false },
      },
    ],
    [
      'gateway is outside the client subnet',
      {
        ...baseState,
        gateway: { ...baseState.gateway, ipAddress: '192.168.2.1' },
      },
    ],
  ] as const)('cannot reach an external IP when %s', (_reason, state) => {
    expect(simulatePing(state, '203.0.113.20')).toEqual({
      reachable: false,
      reason: 'UNREACHABLE',
    })
  })

  it('does not reach an external IP absent from Scenario State', () => {
    expect(simulatePing(baseState, '203.0.113.99')).toEqual({
      reachable: false,
      reason: 'UNREACHABLE',
    })
  })

  it('resolves a hostname before checking its IP route', () => {
    expect(simulatePing(baseState, 'quest.example')).toEqual({
      reachable: true,
      address: '203.0.113.20',
      roundTripTimeMs: 12,
    })
  })

  it('returns HOST_NOT_FOUND when DNS resolution fails', () => {
    expect(simulatePing(baseState, 'missing.example')).toEqual({
      reachable: false,
      reason: 'HOST_NOT_FOUND',
    })
  })

  it('plugs into Network Simulator as a deterministic rule', () => {
    const simulator = createNetworkSimulator(baseState, {
      simulatePing,
      simulateNslookup: () => ({
        resolved: false,
        reason: 'DNS_NOT_CONFIGURED',
      }),
    })

    expect(simulator.simulatePing('gateway')).toEqual(
      simulator.simulatePing('gateway'),
    )
    expect(simulator.simulatePing('gateway')).toMatchObject({
      reachable: true,
      address: '192.168.1.1',
    })
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
