import { describe, expect, it, vi } from 'vitest'
import { createCommandExecutor, type CommandHandler } from './commandExecutor'

describe('createCommandExecutor', () => {
  it('dispatches a parsed command to its registered handler', () => {
    const pingHandler = vi.fn<CommandHandler>(() => ({
      kind: 'output',
      text: 'reply from gateway',
    }))
    const execute = createCommandExecutor({ ping: pingHandler })

    expect(execute({ command: 'ping', args: ['192.168.1.1'] })).toEqual({
      kind: 'output',
      text: 'reply from gateway',
    })
    expect(pingHandler).toHaveBeenCalledOnce()
    expect(pingHandler).toHaveBeenCalledWith(['192.168.1.1'])
  })

  it('returns a controlled error for an unknown command', () => {
    const pingHandler = vi.fn<CommandHandler>()
    const execute = createCommandExecutor({ ping: pingHandler })

    expect(execute({ command: 'reboot', args: [] })).toEqual({
      kind: 'error',
      text: 'command not found: reboot',
    })
    expect(pingHandler).not.toHaveBeenCalled()
  })

  it('does not dispatch to inherited object properties', () => {
    const execute = createCommandExecutor({})

    expect(execute({ command: 'constructor', args: [] })).toEqual({
      kind: 'error',
      text: 'command not found: constructor',
    })
  })

  it('invokes only the handler registered for the requested command', () => {
    const pingHandler = vi.fn<CommandHandler>(() => ({
      kind: 'output',
      text: 'ping result',
    }))
    const nslookupHandler = vi.fn<CommandHandler>(() => ({
      kind: 'output',
      text: 'dns result',
    }))
    const execute = createCommandExecutor({
      ping: pingHandler,
      nslookup: nslookupHandler,
    })

    execute({ command: 'nslookup', args: ['example.test'] })

    expect(nslookupHandler).toHaveBeenCalledWith(['example.test'])
    expect(pingHandler).not.toHaveBeenCalled()
  })
})
