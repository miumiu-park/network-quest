import { describe, expect, it } from 'vitest'
import type { NetworkState } from './networkState'
import { repairIpAddress } from './ipAddressRepair'

const state: NetworkState = {
  client: {
    ipAddress: '192.168.2.10',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServers: ['192.168.1.53'],
    linkUp: true,
  },
  gateway: { ipAddress: '192.168.1.1', online: true },
  dns: {
    servers: [{ ipAddress: '192.168.1.53', online: true, records: {} }],
  },
  internet: { online: true, reachableAddresses: ['203.0.113.20'] },
}

describe('repairIpAddress', () => {
  it('returns an immutable state with an address in the gateway subnet', () => {
    const result = repairIpAddress(state, '192.168.1.10')

    expect(result).toMatchObject({ success: true, changed: true })
    if (result.success) {
      expect(result.state.client.ipAddress).toBe('192.168.1.10')
      expect(Object.isFrozen(result.state.client)).toBe(true)
    }
    expect(state.client.ipAddress).toBe('192.168.2.10')
  })

  it('rejects an address outside the gateway subnet', () => {
    expect(repairIpAddress(state, '10.0.0.10')).toMatchObject({
      success: false,
      error: { code: 'INVALID_IP_ADDRESS' },
    })
  })

  it('rejects the gateway address as a client address conflict', () => {
    expect(repairIpAddress(state, '192.168.1.1')).toMatchObject({
      success: false,
      error: { code: 'ADDRESS_CONFLICT' },
    })
  })
})
