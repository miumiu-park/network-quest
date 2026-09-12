import { describe, expect, it } from 'vitest'
import { loadScenario } from './loadScenario'

const validScenario = {
  id: 'dns-slime',
  title: 'DNS Slimeの名前解決障害',
  event: {
    npcName: 'Net Sage',
    location: 'LAN Village',
    symptom: 'The village guide cannot open quest.example.',
  },
  topology: {
    mainPath: [
      { id: 'pc', name: 'PC', detail: '192.168.1.10' },
      { id: 'switch', name: 'Switch', detail: 'LAN / Layer 2' },
      { id: 'router', name: 'Router', detail: '192.168.1.1' },
      { id: 'internet', name: 'Internet', detail: '203.0.113.20' },
    ],
    dnsNode: { id: 'dns', name: 'DNS', detail: '192.168.1.53' },
    dnsConnectionLabel: 'DNS query',
  },
  enemy: {
    id: 'dns-slime',
    name: 'DNS Slime',
    maxHp: 100,
  },
  network: {
    gateway: '192.168.1.1',
    dnsServer: '192.168.1.53',
  },
  failure: {
    type: 'DNS_MISCONFIGURATION',
    description: 'Hostname resolution fails',
  },
  answer: {
    cause: 'DNS',
  },
  reward: {
    exp: 100,
  },
  learning: {
    summary: 'IP reachability and name resolution are separate checks.',
    keyPoints: ['Verify gateway reachability before testing DNS.'],
  },
}

describe('loadScenario', () => {
  it('parses and validates JSON before returning a Scenario', () => {
    const result = loadScenario(JSON.stringify(validScenario))

    expect(result).toEqual({
      success: true,
      scenario: validScenario,
    })
  })

  it('returns a controlled parse error for malformed JSON', () => {
    expect(loadScenario('{"id":')).toEqual({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Scenario source is not valid JSON',
      },
    })
  })

  it('returns validation details without exposing invalid data', () => {
    const invalidScenario = { ...validScenario, answer: undefined }
    const result = loadScenario(JSON.stringify(invalidScenario))

    expect(result.success).toBe(false)
    expect('scenario' in result).toBe(false)

    if (!result.success && result.error.code === 'INVALID_SCENARIO') {
      expect(result.error.message).toBe('Scenario data failed validation')
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'answer',
          }),
        ]),
      )
    }
  })

  it('treats valid JSON with the wrong shape as a validation error', () => {
    const result = loadScenario('null')

    expect(result).toMatchObject({
      success: false,
      error: {
        code: 'INVALID_SCENARIO',
      },
    })
  })
})
