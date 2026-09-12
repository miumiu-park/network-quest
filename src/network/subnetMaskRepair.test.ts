import { describe, expect, it } from 'vitest'
import type { NetworkState } from './networkState'
import { repairSubnetMask } from './subnetMaskRepair'

const state: NetworkState = {
  client: {
    ipAddress: '192.168.1.10',
    subnetMask: '255.255.255.128',
    gateway: '192.168.1.1',
    dnsServers: ['192.168.1.53'],
    linkUp: true,
  },
  gateway: { ipAddress: '192.168.1.1', online: true },
  dns: {
    servers: [{ ipAddress: '192.168.1.53', online: true, records: {} }],
  },
  internet: { online: true, reachableAddresses: [] },
}

describe('repairSubnetMask', () => {
  it('immutably replaces the client subnet mask', () => {
    const result = repairSubnetMask(state, '255.255.255.0')

    expect(result).toMatchObject({ success: true, changed: true })
    expect(result.state.client.subnetMask).toBe('255.255.255.0')
    expect(state.client.subnetMask).toBe('255.255.255.128')
    expect(Object.isFrozen(result.state)).toBe(true)
  })

  it.each(['255.0.255.0', '255.255.255.1', 'not-a-mask'])(
    'rejects invalid or non-contiguous mask %s',
    (subnetMask) => {
      const result = repairSubnetMask(state, subnetMask)

      expect(result).toMatchObject({
        success: false,
        state,
        error: { code: 'INVALID_SUBNET_MASK', subnetMask },
      })
    },
  )
})
