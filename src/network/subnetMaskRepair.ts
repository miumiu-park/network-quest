import { freezeNetworkState } from './createNetworkState'
import type { NetworkState } from './networkState'
import { isIpv4Address } from './networkStateSchema'

export type SubnetMaskRepairErrorCode = 'INVALID_SUBNET_MASK'

export type SubnetMaskRepairResult =
  | {
      readonly success: true
      readonly state: NetworkState
      readonly changed: boolean
    }
  | {
      readonly success: false
      readonly state: NetworkState
      readonly error: {
        readonly code: SubnetMaskRepairErrorCode
        readonly subnetMask: string
      }
    }

export function repairSubnetMask(
  state: NetworkState,
  subnetMask: string,
): SubnetMaskRepairResult {
  if (!isValidSubnetMask(subnetMask)) {
    return Object.freeze({
      success: false,
      state,
      error: Object.freeze({
        code: 'INVALID_SUBNET_MASK' as const,
        subnetMask,
      }),
    })
  }

  if (state.client.subnetMask === subnetMask) {
    return Object.freeze({ success: true, state, changed: false })
  }

  return Object.freeze({
    success: true,
    state: freezeNetworkState({
      ...state,
      client: { ...state.client, subnetMask },
    }),
    changed: true,
  })
}

function isValidSubnetMask(value: string): boolean {
  if (!isIpv4Address(value)) {
    return false
  }

  const bits = value
    .split('.')
    .map(Number)
    .map((octet) => octet.toString(2).padStart(8, '0'))
    .join('')

  return /^1+0+$/.test(bits)
}
