import { describe, expect, it } from 'vitest'
import { createObservations } from './observation'

describe('createObservations', () => {
  it.each([
    ['output', true],
    ['error', false],
  ] as const)(
    'creates gateway reachability from a ping %s',
    (kind, reachable) => {
      expect(
        createObservations({ command: 'ping', args: ['gateway'] }, { kind }),
      ).toEqual([
        {
          kind: 'GATEWAY_REACHABILITY',
          target: 'gateway',
          reachable,
        },
      ])
    },
  )

  it.each([
    ['output', true],
    ['error', false],
  ] as const)(
    'creates internet reachability from a ping %s',
    (kind, reachable) => {
      expect(
        createObservations(
          { command: 'ping', args: ['203.0.113.20'] },
          { kind },
        ),
      ).toEqual([
        {
          kind: 'INTERNET_REACHABILITY',
          target: '203.0.113.20',
          reachable,
        },
      ])
    },
  )

  it.each([
    ['output', true],
    ['error', false],
  ] as const)(
    'creates a DNS resolution observation from nslookup %s',
    (kind, resolved) => {
      expect(
        createObservations(
          { command: 'nslookup', args: ['quest.example'] },
          { kind },
        ),
      ).toEqual([
        {
          kind: 'DNS_RESOLUTION',
          hostname: 'quest.example',
          resolved,
        },
      ])
    },
  )

  it('does not create an observation for unsupported or invalid commands', () => {
    expect(
      createObservations({ command: 'ip', args: [] }, { kind: 'output' }),
    ).toEqual([])
    expect(
      createObservations({ command: 'ping', args: [] }, { kind: 'error' }),
    ).toEqual([])
  })
})
