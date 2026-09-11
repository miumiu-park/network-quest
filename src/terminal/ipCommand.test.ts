import { describe, expect, it, vi } from 'vitest'
import { createCommandExecutor } from './commandExecutor'
import {
  createIpCommandHandler,
  type ClientInterfaceInfo,
  type InterfaceInfoProviderPort,
} from './ipCommand'

function createProvider(info: ClientInterfaceInfo): InterfaceInfoProviderPort {
  return { getInterfaceInfo: vi.fn(() => info) }
}

describe('createIpCommandHandler', () => {
  it('formats client interface information from Scenario State', () => {
    const provider = createProvider({
      ipAddress: '192.168.1.10',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: ['192.168.1.53', '198.51.100.53'],
    })
    const handler = createIpCommandHandler(provider)

    expect(handler([])).toEqual({
      kind: 'output',
      text: [
        'IP Address:      192.168.1.10',
        'Subnet Mask:     255.255.255.0',
        'Default Gateway: 192.168.1.1',
        'DNS Servers:     192.168.1.53, 198.51.100.53',
      ].join('\n'),
    })
    expect(provider.getInterfaceInfo).toHaveBeenCalledOnce()
  })

  it('shows when DNS is not configured', () => {
    const provider = createProvider({
      ipAddress: '192.168.1.10',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: [],
    })
    const handler = createIpCommandHandler(provider)

    expect(handler([])).toMatchObject({
      kind: 'output',
      text: expect.stringContaining('DNS Servers:     (not configured)'),
    })
  })

  it('rejects arguments without reading interface information', () => {
    const provider = createProvider({
      ipAddress: '192.168.1.10',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: ['192.168.1.53'],
    })
    const handler = createIpCommandHandler(provider)

    expect(handler(['addr'])).toEqual({
      kind: 'error',
      text: 'usage: ip',
    })
    expect(provider.getInterfaceInfo).not.toHaveBeenCalled()
  })

  it('runs through the allow-listed Command Executor', () => {
    const provider = createProvider({
      ipAddress: '192.168.1.10',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServers: ['192.168.1.53'],
    })
    const execute = createCommandExecutor({
      ip: createIpCommandHandler(provider),
    })

    expect(execute({ command: 'ip', args: [] })).toMatchObject({
      kind: 'output',
    })
    expect(provider.getInterfaceInfo).toHaveBeenCalledOnce()
  })
})
