import { freezeNetworkState } from './createNetworkState'
import type { NetworkState } from './networkState'
import { isIpv4Address } from './networkStateSchema'

export type IpAddressRepairErrorCode = 'INVALID_IP_ADDRESS' | 'ADDRESS_CONFLICT'

export type IpAddressRepairResult =
  | {
      readonly success: true
      readonly state: NetworkState
      readonly changed: boolean
    }
  | {
      readonly success: false
      readonly state: NetworkState
      readonly error: {
        readonly code: IpAddressRepairErrorCode
        readonly ipAddress: string
      }
    }

export function repairIpAddress(
  state: NetworkState,
  ipAddress: string,
): IpAddressRepairResult {
  if (!isIpv4Address(ipAddress) || !isSameSubnet(ipAddress, state)) {
    return failure(state, 'INVALID_IP_ADDRESS', ipAddress)
  }

  if (ipAddress === state.gateway.ipAddress) {
    return failure(state, 'ADDRESS_CONFLICT', ipAddress)
  }

  if (state.client.ipAddress === ipAddress) {
    return Object.freeze({ success: true, state, changed: false })
  }

  return Object.freeze({
    success: true,
    state: freezeNetworkState({
      ...state,
      client: { ...state.client, ipAddress },
    }),
    changed: true,
  })
}

function isSameSubnet(ipAddress: string, state: NetworkState): boolean {
  const mask = ipv4ToUint32(state.client.subnetMask)
  return (
    (ipv4ToUint32(ipAddress) & mask) ===
    (ipv4ToUint32(state.gateway.ipAddress) & mask)
  )
}

function ipv4ToUint32(address: string): number {
  return address
    .split('.')
    .reduce((value, octet) => (value << 8) | Number(octet), 0)
}

function failure(
  state: NetworkState,
  code: IpAddressRepairErrorCode,
  ipAddress: string,
): IpAddressRepairResult {
  return Object.freeze({
    success: false,
    state,
    error: Object.freeze({ code, ipAddress }),
  })
}
