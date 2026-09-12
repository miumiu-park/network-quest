import { describe, expect, it } from 'vitest'
import type { Scenario } from './scenario'

const scenario = {
  id: 'dns-slime',
  title: 'DNS Slimeの名前解決障害',
  event: {
    npcName: 'Net Sage',
    location: 'LAN Village',
    symptom: 'The village guide cannot open quest.example.',
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
} satisfies Scenario

describe('Scenario', () => {
  it('separates each scenario responsibility in the domain model', () => {
    expect(Object.keys(scenario)).toEqual([
      'id',
      'title',
      'event',
      'enemy',
      'network',
      'failure',
      'answer',
      'reward',
      'learning',
    ])
  })
})
