import type { CommandHandler } from './commandExecutor'
import type { NetworkSimulator } from '../network/networkSimulator'

export function createNslookupCommandHandler(
  simulator: Pick<NetworkSimulator, 'simulateNslookup'>,
): CommandHandler {
  return (args) => {
    if (args.length !== 1) {
      return {
        kind: 'error',
        text: 'usage: nslookup <hostname>',
      }
    }

    const [hostname] = args
    const result = simulator.simulateNslookup(hostname)

    if (result.resolved) {
      return {
        kind: 'output',
        text: [
          `Server:  ${result.server}`,
          '',
          `Name:    ${hostname}`,
          `Address: ${result.address}`,
        ].join('\n'),
      }
    }

    if (result.reason === 'DNS_NOT_CONFIGURED') {
      return {
        kind: 'error',
        text: 'nslookup: no DNS servers configured',
      }
    }

    if (result.reason === 'SERVER_UNREACHABLE') {
      return {
        kind: 'error',
        text: `;; communications error to ${result.server}: timed out`,
      }
    }

    if (result.reason === 'DNS_MISCONFIGURED') {
      return {
        kind: 'error',
        text: `nslookup: configured DNS server ${result.server} is not available`,
      }
    }

    return {
      kind: 'error',
      text: [
        `Server: ${result.server}`,
        `** server can't find ${hostname}: NXDOMAIN`,
      ].join('\n'),
    }
  }
}
