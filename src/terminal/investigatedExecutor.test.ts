import { describe, expect, it, vi } from 'vitest'
import { createInvestigationHistory } from '../investigation'
import { createInvestigatedExecutor } from './investigatedExecutor'
import type { TerminalExecutor } from './terminalTypes'

describe('createInvestigatedExecutor', () => {
  it('returns the command result and records a structured observation', () => {
    const result = { kind: 'output' as const, text: 'Reply from 192.168.1.1' }
    const execute = vi.fn<TerminalExecutor>(() => result)
    const history = createInvestigationHistory(() => 1_789_084_800_000)
    const investigatedExecute = createInvestigatedExecutor(execute, history)

    expect(investigatedExecute({ command: 'ping', args: ['gateway'] })).toBe(
      result,
    )
    expect(history.getEntries()).toEqual([
      {
        command: 'ping',
        args: ['gateway'],
        result,
        observations: [
          {
            kind: 'GATEWAY_REACHABILITY',
            target: 'gateway',
            reachable: true,
          },
        ],
        timestamp: 1_789_084_800_000,
      },
    ])
  })

  it('records a failed DNS resolution without changing the result', () => {
    const result = { kind: 'error' as const, text: 'host not found' }
    const execute = vi.fn<TerminalExecutor>(() => result)
    const history = createInvestigationHistory(() => 100)
    const investigatedExecute = createInvestigatedExecutor(execute, history)

    expect(
      investigatedExecute({
        command: 'nslookup',
        args: ['missing.example'],
      }),
    ).toBe(result)
    expect(history.getEntries()[0].observations).toEqual([
      {
        kind: 'DNS_RESOLUTION',
        hostname: 'missing.example',
        resolved: false,
      },
    ])
  })
})
