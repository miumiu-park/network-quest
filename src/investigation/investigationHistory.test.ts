import { describe, expect, it, vi } from 'vitest'
import { createInvestigationHistory } from './investigationHistory'

describe('createInvestigationHistory', () => {
  it('starts with an empty history', () => {
    const history = createInvestigationHistory()

    expect(history.getEntries()).toEqual([])
  })

  it('records command, args, result and the injected timestamp', () => {
    const clock = vi.fn(() => 1_789_084_800_000)
    const history = createInvestigationHistory(clock)

    const entry = history.addEntry({
      command: 'ping',
      args: ['gateway'],
      result: { kind: 'output', text: 'Reply from 192.168.1.1' },
    })

    expect(entry).toEqual({
      command: 'ping',
      args: ['gateway'],
      result: { kind: 'output', text: 'Reply from 192.168.1.1' },
      observations: [],
      timestamp: 1_789_084_800_000,
    })
    expect(history.getEntries()).toEqual([entry])
    expect(clock).toHaveBeenCalledOnce()
  })

  it('retains entries in the order they were added', () => {
    const timestamps = [100, 200]
    const history = createInvestigationHistory(() => timestamps.shift() ?? 0)

    history.addEntry({
      command: 'ip',
      args: ['addr'],
      result: { kind: 'output', text: '192.168.1.10' },
    })
    history.addEntry({
      command: 'nslookup',
      args: ['missing.example'],
      result: { kind: 'error', text: 'host not found' },
    })

    expect(
      history.getEntries().map(({ command, timestamp }) => ({
        command,
        timestamp,
      })),
    ).toEqual([
      { command: 'ip', timestamp: 100 },
      { command: 'nslookup', timestamp: 200 },
    ])
  })

  it('stores an immutable snapshot of mutable input values', () => {
    const args = ['gateway']
    const result = { kind: 'output' as const, text: 'reachable' }
    const history = createInvestigationHistory(() => 100)

    history.addEntry({ command: 'ping', args, result })
    args[0] = '203.0.113.20'
    result.text = 'changed'

    const entries = history.getEntries()
    expect(entries[0]).toMatchObject({
      args: ['gateway'],
      result: { kind: 'output', text: 'reachable' },
    })
    expect(Object.isFrozen(entries)).toBe(true)
    expect(Object.isFrozen(entries[0])).toBe(true)
    expect(Object.isFrozen(entries[0].args)).toBe(true)
    expect(Object.isFrozen(entries[0].result)).toBe(true)
    expect(Object.isFrozen(entries[0].observations)).toBe(true)
  })

  it('keeps separate history instances isolated', () => {
    const firstHistory = createInvestigationHistory(() => 100)
    const secondHistory = createInvestigationHistory(() => 200)

    firstHistory.addEntry({
      command: 'ping',
      args: ['gateway'],
      result: { kind: 'output', text: 'reachable' },
    })

    expect(firstHistory.getEntries()).toHaveLength(1)
    expect(secondHistory.getEntries()).toEqual([])
  })
})
