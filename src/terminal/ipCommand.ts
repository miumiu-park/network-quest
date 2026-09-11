import type { CommandHandler } from './commandExecutor'
import type { NetworkSimulator } from '../network/networkSimulator'

export function createIpCommandHandler(
  provider: Pick<NetworkSimulator, 'getInterfaceInfo'>,
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
