import { describe, expect, it } from 'vitest'
import { parseCommand } from './commandParser'

describe('parseCommand', () => {
  it('parses a command and its arguments', () => {
    expect(parseCommand('ping 192.168.1.1')).toEqual({
      ok: true,
      value: {
        command: 'ping',
        args: ['192.168.1.1'],
      },
    })
  })

  it('normalizes surrounding spaces and separates multiple arguments', () => {
    expect(parseCommand('  nslookup\texample.test  192.168.1.53  ')).toEqual({
      ok: true,
      value: {
        command: 'nslookup',
        args: ['example.test', '192.168.1.53'],
      },
    })
  })

  it.each(['', ' ', '\t'])('rejects empty input %#', (input) => {
    expect(parseCommand(input)).toEqual({
      ok: false,
      error: {
        code: 'EMPTY_INPUT',
        message: 'コマンドを入力してください。',
      },
    })
  })

  it.each([
    ['Ping gateway', 'INVALID_COMMAND'],
    ['ping gateway;reboot', 'INVALID_ARGUMENT'],
    ['ping $(hostname)', 'INVALID_ARGUMENT'],
    ['ping gateway\nreboot', 'INVALID_ARGUMENT'],
    ['ping "gateway"', 'INVALID_ARGUMENT'],
  ] as const)('rejects invalid input %j', (input, errorCode) => {
    const result = parseCommand(input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(errorCode)
    }
  })

  it('rejects excessively long input', () => {
    const result = parseCommand(`ping ${'a'.repeat(252)}`)

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'INPUT_TOO_LONG' },
    })
  })
})
