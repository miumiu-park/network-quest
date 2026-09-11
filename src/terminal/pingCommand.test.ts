import { describe, expect, it, vi } from 'vitest'
import type {
  NetworkSimulator,
  PingSimulationResult,
} from '../network/networkSimulator'
import { createCommandExecutor } from './commandExecutor'
import { createPingCommandHandler } from './pingCommand'

function createSimulator(
  result: PingSimulationResult,
): Pick<NetworkSimulator, 'simulatePing'> {
  return { simulatePing: vi.fn(() => result) }
}

describe('createPingCommandHandler', () => {
  it.each([
    ['gateway', '192.168.1.1'],
    ['203.0.113.10', '203.0.113.10'],
    ['quest.example', '203.0.113.20'],
  ])('renders a successful ping result for %s', (target, address) => {
    const simulator = createSimulator({
      reachable: true,
      address,
      roundTripTimeMs: 12,
    })
    const handler = createPingCommandHandler(simulator)

    expect(handler([target])).toEqual({
      kind: 'output',
      text: `PING ${target} (${address})\nReply from ${address}: time=12ms`,
    })
    expect(simulator.simulatePing).toHaveBeenCalledWith(target)
  })

  it.each(['gateway', '203.0.113.10', 'quest.example'])(
    'renders an unreachable ping result for %s',
    (target) => {
      const simulator = createSimulator({
        reachable: false,
        reason: 'UNREACHABLE',
      })
      const handler = createPingCommandHandler(simulator)

      expect(handler([target])).toEqual({
        kind: 'error',
        text: `PING ${target}\nRequest timed out.`,
      })
      expect(simulator.simulatePing).toHaveBeenCalledWith(target)
    },
  )

  it('distinguishes hostname resolution failure from unreachable IP', () => {
    const simulator = createSimulator({
      reachable: false,
      reason: 'HOST_NOT_FOUND',
    })
    const handler = createPingCommandHandler(simulator)

    expect(handler(['quest.example'])).toEqual({
      kind: 'error',
      text: 'ping: quest.example: Name or service not known',
    })
  })

  it.each([{ args: [] }, { args: ['gateway', 'extra'] }])(
    'rejects an invalid argument count without consulting the simulator',
    ({ args }) => {
      const simulator = createSimulator({
        reachable: true,
        address: '192.168.1.1',
        roundTripTimeMs: 1,
      })
      const handler = createPingCommandHandler(simulator)

      expect(handler(args)).toEqual({
        kind: 'error',
        text: 'usage: ping <target>',
      })
      expect(simulator.simulatePing).not.toHaveBeenCalled()
    },
  )

  it('runs through the allow-listed Command Executor', () => {
    const simulator = createSimulator({
      reachable: true,
      address: '192.168.1.1',
      roundTripTimeMs: 3,
    })
    const execute = createCommandExecutor({
      ping: createPingCommandHandler(simulator),
    })

    expect(execute({ command: 'ping', args: ['gateway'] })).toMatchObject({
      kind: 'output',
    })
    expect(simulator.simulatePing).toHaveBeenCalledWith('gateway')
  })
})
