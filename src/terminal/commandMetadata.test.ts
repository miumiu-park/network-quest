import { describe, expect, it } from 'vitest'
import { createHelpResult, createUsageError } from './commandMetadata'

const availableCommands = ['help', 'ip', 'ping', 'nslookup']

describe('command metadata', () => {
  it('lists only the internally available safe commands', () => {
    expect(createHelpResult([], availableCommands)).toMatchObject({
      kind: 'output',
      text: expect.stringMatching(/help.*ip.*ping.*nslookup/s),
    })
  })

  it('shows usage and a safe example without scenario solutions', () => {
    expect(createHelpResult(['nslookup'], availableCommands)).toEqual({
      kind: 'output',
      text: [
        'nslookup — 指定したhostnameの名前解決をSimulationで確認します。',
        'Usage: nslookup <hostname>',
        'Example: nslookup example.test',
      ].join('\n'),
    })
  })

  it('returns actionable controlled errors for invalid help and arguments', () => {
    expect(createHelpResult(['reboot'], availableCommands)).toEqual({
      kind: 'error',
      text: 'help: unknown command: reboot\nRun "help" to list available commands.',
    })
    expect(createUsageError('ping')).toEqual({
      kind: 'error',
      text: 'usage: ping <target>\nRun "help ping" for details.',
    })
  })
})
