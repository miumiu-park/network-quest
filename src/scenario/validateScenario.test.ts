import { describe, expect, it } from 'vitest'
import { validateScenario } from './validateScenario'

const validScenario = {
  id: 'dns-slime',
  title: 'DNS Slimeの名前解決障害',
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

describe('validateScenario', () => {
  it('returns a typed Scenario for valid JSON data', () => {
    const result = validateScenario(validScenario)

    expect(result).toEqual({
      success: true,
      scenario: validScenario,
    })
  })

  it('returns controlled issues instead of throwing for invalid data', () => {
    const invalidScenario = {
      ...validScenario,
      id: 'DNS Slime',
      enemy: {
        ...validScenario.enemy,
        maxHp: 0,
      },
      learning: {
        ...validScenario.learning,
        keyPoints: [],
      },
    }

    expect(() => validateScenario(invalidScenario)).not.toThrow()

    const result = validateScenario(invalidScenario)
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.message).toBe('Invalid scenario data')
      expect(result.error.issues.map((issue) => issue.path)).toEqual(
        expect.arrayContaining(['id', 'enemy.maxHp', 'learning.keyPoints']),
      )
    }
  })

  it('does not expose invalid Scenario data to callers', () => {
    const result = validateScenario({
      ...validScenario,
      answer: undefined,
    })

    expect(result.success).toBe(false)
    expect('scenario' in result).toBe(false)
  })

  it('rejects unknown top-level fields', () => {
    const result = validateScenario({
      ...validScenario,
      executeShell: true,
    })

    expect(result.success).toBe(false)
  })
})
