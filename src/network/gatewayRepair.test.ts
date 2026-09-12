import { describe, expect, it } from 'vitest'
import { repairGatewayConfiguration } from './gatewayRepair'
import type { NetworkState } from './networkState'

const state: NetworkState = {
  client: {
    ipAddress: '192.168.1.10',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.254',
    dnsServers: ['192.168.1.53'],
    linkUp: true,
  },
  gateway: { ipAddress: '192.168.1.1', online: true },
  dns: {
    servers: [{ ipAddress: '192.168.1.53', online: true, records: {} }],
  },
  internet: { online: true, reachableAddresses: ['203.0.113.20'] },
}

describe('repairGatewayConfiguration', () => {
  it('returns an immutable state with the corrected default gateway', () => {
    const result = repairGatewayConfiguration(state, '192.168.1.1')

    expect(result).toMatchObject({ success: true, changed: true })
    if (result.success) {
      expect(result.state.client.gateway).toBe('192.168.1.1')
      expect(Object.isFrozen(result.state)).toBe(true)
      expect(Object.isFrozen(result.state.client)).toBe(true)
    }
    expect(state.client.gateway).toBe('192.168.1.254')
  })

  it('rejects an address that is not the Scenario gateway', () => {
    expect(repairGatewayConfiguration(state, '192.168.1.253')).toMatchObject({
      success: false,
      error: { code: 'GATEWAY_NOT_FOUND' },
    })
  })
})
