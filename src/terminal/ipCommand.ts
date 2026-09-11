import type { CommandHandler } from './commandExecutor'

export interface ClientInterfaceInfo {
  readonly ipAddress: string
  readonly subnetMask: string
  readonly gateway: string
  readonly dnsServers: readonly string[]
}

/**
 * Port implemented by the virtual Network Simulator.
 * Implementations must return Scenario State, never host interface information.
 */
export interface InterfaceInfoProviderPort {
  getInterfaceInfo(): ClientInterfaceInfo
}

export function createIpCommandHandler(
  provider: InterfaceInfoProviderPort,
): CommandHandler {
  return (args) => {
    if (args.length !== 0) {
      return {
        kind: 'error',
        text: 'usage: ip',
      }
    }

    const info = provider.getInterfaceInfo()

    return {
      kind: 'output',
      text: [
        `IP Address:      ${info.ipAddress}`,
        `Subnet Mask:     ${info.subnetMask}`,
        `Default Gateway: ${info.gateway}`,
        `DNS Servers:     ${formatDnsServers(info.dnsServers)}`,
      ].join('\n'),
    }
  }
}

function formatDnsServers(dnsServers: readonly string[]): string {
  return dnsServers.length > 0 ? dnsServers.join(', ') : '(not configured)'
}
