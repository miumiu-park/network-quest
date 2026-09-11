import type { DnsServerNetworkState, NetworkState } from './networkState'
import type { NslookupSimulationResult } from './networkSimulator'

export function simulateNslookup(
  state: NetworkState,
  hostname: string,
): NslookupSimulationResult {
  const [firstConfiguredServer] = state.client.dnsServers

  if (firstConfiguredServer === undefined) {
    return { resolved: false, reason: 'DNS_NOT_CONFIGURED' }
  }

  const configuredServers = state.client.dnsServers
    .map((address) =>
      state.dns.servers.find((server) => server.ipAddress === address),
    )
    .filter((server): server is DnsServerNetworkState => server !== undefined)

  if (configuredServers.length === 0) {
    return {
      resolved: false,
      reason: 'DNS_MISCONFIGURED',
      server: firstConfiguredServer,
    }
  }

  const availableServer = configuredServers.find((server) => server.online)

  if (!state.client.linkUp || availableServer === undefined) {
    return {
      resolved: false,
      reason: 'SERVER_UNREACHABLE',
      server: configuredServers[0].ipAddress,
    }
  }

  const normalizedHostname = normalizeHostname(hostname)
  const record = Object.entries(availableServer.records).find(
    ([recordHostname]) =>
      normalizeHostname(recordHostname) === normalizedHostname,
  )

  if (record === undefined) {
    return {
      resolved: false,
      reason: 'HOST_NOT_FOUND',
      server: availableServer.ipAddress,
    }
  }

  return {
    resolved: true,
    server: availableServer.ipAddress,
    address: record[1],
  }
}

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, '')
}
