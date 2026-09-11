import type { CommandHandler } from './commandExecutor'

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
      readonly reason: 'SERVER_UNREACHABLE' | 'HOST_NOT_FOUND'
      readonly server: string
    }

/**
 * Port implemented by the virtual Network Simulator.
 * Implementations must resolve names from Scenario State without real DNS I/O.
 */
export interface NslookupSimulatorPort {
  simulateNslookup(hostname: string): NslookupSimulationResult
}

export function createNslookupCommandHandler(
  simulator: NslookupSimulatorPort,
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

    return {
      kind: 'error',
      text: [
        `Server: ${result.server}`,
        `** server can't find ${hostname}: NXDOMAIN`,
      ].join('\n'),
    }
  }
}
