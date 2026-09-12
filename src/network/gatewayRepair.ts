import { freezeNetworkState } from './createNetworkState'
import type { NetworkState } from './networkState'

export type GatewayRepairErrorCode = 'GATEWAY_NOT_FOUND' | 'GATEWAY_OFFLINE'

export type GatewayRepairResult =
  | {
      readonly success: true
      readonly state: NetworkState
      readonly changed: boolean
    }
  | {
      readonly success: false
      readonly state: NetworkState
      readonly error: {
        readonly code: GatewayRepairErrorCode
        readonly gateway: string
      }
    }

export function repairGatewayConfiguration(
  state: NetworkState,
  gatewayAddress: string,
): GatewayRepairResult {
  if (state.gateway.ipAddress !== gatewayAddress) {
    return Object.freeze({
      success: false,
      state,
      error: Object.freeze({
        code: 'GATEWAY_NOT_FOUND' as const,
        gateway: gatewayAddress,
      }),
    })
  }

  if (!state.gateway.online) {
    return Object.freeze({
      success: false,
      state,
      error: Object.freeze({
        code: 'GATEWAY_OFFLINE' as const,
        gateway: gatewayAddress,
      }),
    })
  }

  if (state.client.gateway === gatewayAddress) {
    return Object.freeze({ success: true, state, changed: false })
  }

  return Object.freeze({
    success: true,
    state: freezeNetworkState({
      ...state,
      client: { ...state.client, gateway: gatewayAddress },
    }),
    changed: true,
  })
}
