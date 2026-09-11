import type { CommandHandler } from './commandExecutor'
import type { NetworkSimulator } from '../network/networkSimulator'

export function createPingCommandHandler(
  simulator: Pick<NetworkSimulator, 'simulatePing'>,
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
