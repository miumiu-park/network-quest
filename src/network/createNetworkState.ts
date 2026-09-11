import type { Scenario } from '../scenario'
import type { NetworkState } from './networkState'
import { networkStateSchema } from './networkStateSchema'

export interface NetworkStateValidationIssue {
  readonly code: string
  readonly path: string
  readonly message: string
}

export interface NetworkStateValidationError {
  readonly message: 'Invalid network state in scenario'
  readonly issues: readonly NetworkStateValidationIssue[]
}

export type NetworkStateCreationResult =
  | { readonly success: true; readonly state: NetworkState }
  | { readonly success: false; readonly error: NetworkStateValidationError }

export function createNetworkState(
  scenario: Pick<Scenario, 'network'>,
): NetworkStateCreationResult {
  const result = networkStateSchema.safeParse(scenario.network)

  if (!result.success) {
    return {
      success: false,
      error: {
        message: 'Invalid network state in scenario',
        issues: result.error.issues.map((issue) => ({
          code: issue.code,
          path: ['network', ...issue.path.map(String)].join('.'),
          message: issue.message,
        })),
      },
    }
  }

  return {
    success: true,
    state: freezeNetworkState(result.data),
  }
}

export function freezeNetworkState(state: NetworkState): NetworkState {
  return Object.freeze({
    client: Object.freeze({
      ...state.client,
      dnsServers: Object.freeze([...state.client.dnsServers]),
    }),
    gateway: Object.freeze({ ...state.gateway }),
    dns: Object.freeze({
      servers: Object.freeze(
        state.dns.servers.map((server) =>
          Object.freeze({
            ...server,
            records: Object.freeze({ ...server.records }),
          }),
        ),
      ),
    }),
    internet: Object.freeze({
      ...state.internet,
      reachableAddresses: Object.freeze([...state.internet.reachableAddresses]),
    }),
  })
}
