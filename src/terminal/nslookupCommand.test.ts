import { describe, expect, it, vi } from 'vitest'
import type {
  NetworkSimulator,
  NslookupSimulationResult,
} from '../network/networkSimulator'
import { createCommandExecutor } from './commandExecutor'
import { createNslookupCommandHandler } from './nslookupCommand'

function createSimulator(
  result: NslookupSimulationResult,
): Pick<NetworkSimulator, 'simulateNslookup'> {
  return { simulateNslookup: vi.fn(() => result) }
}

describe('createNslookupCommandHandler', () => {
  it('formats a successful name resolution from Scenario State', () => {
    const simulator = createSimulator({
      resolved: true,
      server: '192.168.1.53',
      address: '203.0.113.20',
    })
    const handler = createNslookupCommandHandler(simulator)

    expect(handler(['quest.example'])).toEqual({
      kind: 'output',
      text: [
        'Server:  192.168.1.53',
        '',
        'Name:    quest.example',
        'Address: 203.0.113.20',
      ].join('\n'),
    })
    expect(simulator.simulateNslookup).toHaveBeenCalledWith('quest.example')
  })

  it('reports a missing client DNS configuration', () => {
    const simulator = createSimulator({
      resolved: false,
      reason: 'DNS_NOT_CONFIGURED',
    })
    const handler = createNslookupCommandHandler(simulator)

    expect(handler(['quest.example'])).toEqual({
      kind: 'error',
      text: 'nslookup: no DNS servers configured',
    })
  })

  it('reports an unreachable DNS server', () => {
    const simulator = createSimulator({
      resolved: false,
      reason: 'SERVER_UNREACHABLE',
      server: '192.168.1.53',
    })
    const handler = createNslookupCommandHandler(simulator)

    expect(handler(['quest.example'])).toEqual({
      kind: 'error',
      text: ';; communications error to 192.168.1.53: timed out',
    })
  })

  it('reports a missing hostname record', () => {
    const simulator = createSimulator({
      resolved: false,
      reason: 'HOST_NOT_FOUND',
      server: '192.168.1.53',
    })
    const handler = createNslookupCommandHandler(simulator)

    expect(handler(['missing.example'])).toEqual({
      kind: 'error',
      text: [
        'Server: 192.168.1.53',
        "** server can't find missing.example: NXDOMAIN",
      ].join('\n'),
    })
  })

  it.each([{ args: [] }, { args: ['quest.example', 'extra'] }])(
    'rejects an invalid argument count without consulting the simulator',
    ({ args }) => {
      const simulator = createSimulator({
        resolved: true,
        server: '192.168.1.53',
        address: '203.0.113.20',
      })
      const handler = createNslookupCommandHandler(simulator)

      expect(handler(args)).toEqual({
        kind: 'error',
        text: 'usage: nslookup <hostname>',
      })
      expect(simulator.simulateNslookup).not.toHaveBeenCalled()
    },
  )

  it('runs through the allow-listed Command Executor', () => {
    const simulator = createSimulator({
      resolved: true,
      server: '192.168.1.53',
      address: '203.0.113.20',
    })
    const execute = createCommandExecutor({
      nslookup: createNslookupCommandHandler(simulator),
    })

    expect(
      execute({ command: 'nslookup', args: ['quest.example'] }),
    ).toMatchObject({ kind: 'output' })
    expect(simulator.simulateNslookup).toHaveBeenCalledWith('quest.example')
  })
})
