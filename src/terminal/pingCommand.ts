import type { CommandHandler } from './commandExecutor'

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

/**
 * Port implemented by the virtual Network Simulator.
 * Implementations must derive results only from validated Scenario State.
 */
export interface PingSimulatorPort {
  simulatePing(target: string): PingSimulationResult
}

export function createPingCommandHandler(
  simulator: PingSimulatorPort,
): CommandHandler {
  return (args) => {
    if (args.length !== 1) {
      return {
        kind: 'error',
        text: 'usage: ping <target>',
      }
    }

    const [target] = args
    const result = simulator.simulatePing(target)

    if (result.reachable) {
      return {
        kind: 'output',
        text: [
          `PING ${target} (${result.address})`,
          `Reply from ${result.address}: time=${result.roundTripTimeMs}ms`,
        ].join('\n'),
      }
    }

    if (result.reason === 'HOST_NOT_FOUND') {
      return {
        kind: 'error',
        text: `ping: ${target}: Name or service not known`,
      }
    }

    return {
      kind: 'error',
      text: [`PING ${target}`, 'Request timed out.'].join('\n'),
    }
  }
}
