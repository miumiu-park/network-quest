import { describe, expect, it } from 'vitest'
import type { InvestigationHistoryEntry } from '../investigation'
import { DNS_SLIME_SCENARIO } from '../scenario'
import { createLearningReview } from './learningReview'

const history: readonly InvestigationHistoryEntry[] = [
  {
    command: 'ping',
    args: ['gateway'],
    result: { kind: 'output', text: 'Reply from 192.168.1.1' },
    observations: [],
    timestamp: 100,
  },
  {
    command: 'ping',
    args: ['203.0.113.20'],
    result: { kind: 'output', text: 'Reply from 203.0.113.20' },
    observations: [],
    timestamp: 200,
  },
  {
    command: 'nslookup',
    args: ['quest.example'],
    result: { kind: 'error', text: 'DNS request failed' },
    observations: [],
    timestamp: 300,
  },
]

describe('createLearningReview', () => {
  it('combines the cleared Scenario with the ordered investigation history', () => {
    expect(createLearningReview(DNS_SLIME_SCENARIO, history)).toEqual({
      scenarioId: 'dns-slime',
      symptom: 'DNS Slimeの名前解決障害',
      cause: {
        type: 'DNS',
        description:
          'ClientのDNS設定がScenario内に存在しないアドレスを参照している。',
      },
      usedCommands: ['ping', 'nslookup'],
      investigationSteps: [
        { command: 'ping gateway', result: 'Reply from 192.168.1.1' },
        {
          command: 'ping 203.0.113.20',
          result: 'Reply from 203.0.113.20',
        },
        { command: 'nslookup quest.example', result: 'DNS request failed' },
      ],
      recommendedSteps: DNS_SLIME_SCENARIO.learning.keyPoints,
      reasoning: DNS_SLIME_SCENARIO.learning.summary,
    })
  })

  it('returns an immutable review without mutating its inputs', () => {
    const review = createLearningReview(DNS_SLIME_SCENARIO, history)

    expect(Object.isFrozen(review)).toBe(true)
    expect(Object.isFrozen(review.cause)).toBe(true)
    expect(Object.isFrozen(review.usedCommands)).toBe(true)
    expect(Object.isFrozen(review.investigationSteps)).toBe(true)
    expect(Object.isFrozen(review.investigationSteps[0])).toBe(true)
    expect(Object.isFrozen(review.recommendedSteps)).toBe(true)
    expect(history[0].args).toEqual(['gateway'])
  })
})
