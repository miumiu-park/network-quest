import { freezeNetworkState } from './createNetworkState'
import type { NetworkState } from './networkState'

export type DnsRepairErrorCode = 'DNS_SERVER_NOT_FOUND' | 'DNS_SERVER_OFFLINE'

export interface DnsRepairError {
  readonly code: DnsRepairErrorCode
  readonly server: string
}

export type DnsRepairResult =
  | {
      readonly success: true
      readonly state: NetworkState
      readonly changed: boolean
    }
  | {
      readonly success: false
      readonly state: NetworkState
      readonly error: DnsRepairError
    }

export function repairDnsConfiguration(
  state: NetworkState,
  dnsServerAddress: string,
): DnsRepairResult {
  const server = state.dns.servers.find(
    ({ ipAddress }) => ipAddress === dnsServerAddress,
  )

  if (server === undefined) {
    return Object.freeze({
      success: false,
      state,
      error: Object.freeze({
        code: 'DNS_SERVER_NOT_FOUND',
        server: dnsServerAddress,
      }),
    })
  }

  if (!server.online) {
    return Object.freeze({
      success: false,
      state,
      error: Object.freeze({
        code: 'DNS_SERVER_OFFLINE',
        server: dnsServerAddress,
      }),
    })
  }

  if (
    state.client.dnsServers.length === 1 &&
    state.client.dnsServers[0] === dnsServerAddress
  ) {
    return Object.freeze({ success: true, state, changed: false })
  }

  const repairedState = freezeNetworkState({
    ...state,
    client: {
      ...state.client,
      dnsServers: [dnsServerAddress],
    },
  })

  return Object.freeze({
    success: true,
    state: repairedState,
    changed: true,
  })
}
