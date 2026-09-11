import type { NetworkState } from './networkState'

export type PingSimulationResult =
  | {
      readonly reachable: true
      readonly address: string
      readonly roundTripTimeMs: number
    }
  | {
      readonly reachable: false
      readonly reason: 'UNREACHABLE' | 'HOST_NOT_FOUND'
    }

export type NslookupSimulationResult =
  | {
      readonly resolved: true
      readonly server: string
      readonly address: string
    }
  | {
      readonly resolved: false
      readonly reason: 'DNS_NOT_CONFIGURED'
    }
  | {
      readonly resolved: false
      readonly reason:
        'DNS_MISCONFIGURED' | 'SERVER_UNREACHABLE' | 'HOST_NOT_FOUND'
      readonly server: string
    }

export interface ClientInterfaceInfo {
  readonly ipAddress: string
  readonly subnetMask: string
  readonly gateway: string
  readonly dnsServers: readonly string[]
}

export interface NetworkSimulationRules {
  simulatePing(state: NetworkState, target: string): PingSimulationResult
  simulateNslookup(
    state: NetworkState,
    hostname: string,
  ): NslookupSimulationResult
}

export interface NetworkSimulator {
  simulatePing(target: string): PingSimulationResult
  simulateNslookup(hostname: string): NslookupSimulationResult
  getInterfaceInfo(): ClientInterfaceInfo
}

/**
 * Binds pure simulation rules to one validated Scenario Network State.
 * Concrete reachability and DNS rules are supplied by their respective modules.
 */
export function createNetworkSimulator(
  state: NetworkState,
  rules: NetworkSimulationRules,
): NetworkSimulator {
  return Object.freeze({
    simulatePing(target: string) {
      return rules.simulatePing(state, target)
    },
    simulateNslookup(hostname: string) {
      return rules.simulateNslookup(state, hostname)
    },
    getInterfaceInfo() {
      return Object.freeze({
        ipAddress: state.client.ipAddress,
        subnetMask: state.client.subnetMask,
        gateway: state.client.gateway,
        dnsServers: Object.freeze([...state.client.dnsServers]),
      })
    },
  })
}
