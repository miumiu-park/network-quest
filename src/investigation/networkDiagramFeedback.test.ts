import { describe, expect, it } from 'vitest'
import { DNS_SLIME_SCENARIO, SUBNET_GOLEM_SCENARIO } from '../scenario'
import { createNetworkDiagramFeedback } from './networkDiagramFeedback'

describe('Network Diagram feedback projection', () => {
  it('projects gateway, internet and DNS observations without UI judgments', () => {
    const feedback = createNetworkDiagramFeedback(DNS_SLIME_SCENARIO.topology, [
      {
        kind: 'GATEWAY_REACHABILITY',
        target: 'gateway',
        reachable: true,
      },
      {
        kind: 'INTERNET_REACHABILITY',
        target: '203.0.113.20',
        reachable: true,
      },
      {
        kind: 'DNS_RESOLUTION',
        hostname: 'quest.example',
        resolved: false,
      },
    ])

    expect(feedback.nodeStatuses).toMatchObject({
      router: 'SUCCESS',
      internet: 'SUCCESS',
      dns: 'FAILURE',
    })
    expect(
      feedback.items.map(({ label, status }) => ({ label, status })),
    ).toEqual([
      { label: 'Gateway (gateway)', status: 'SUCCESS' },
      { label: 'Target (203.0.113.20)', status: 'SUCCESS' },
      { label: 'DNS (quest.example)', status: 'FAILURE' },
    ])
  })

  it('keeps only the latest result for the same target', () => {
    const feedback = createNetworkDiagramFeedback(DNS_SLIME_SCENARIO.topology, [
      {
        kind: 'DNS_RESOLUTION',
        hostname: 'quest.example',
        resolved: false,
      },
      {
        kind: 'DNS_RESOLUTION',
        hostname: 'quest.example',
        resolved: true,
      },
    ])

    expect(feedback.nodeStatuses.dns).toBe('SUCCESS')
    expect(feedback.items).toHaveLength(1)
  })

  it('maps Subnet peer targets to the topology branch without scenario IDs', () => {
    const feedback = createNetworkDiagramFeedback(
      SUBNET_GOLEM_SCENARIO.topology,
      [
        {
          kind: 'INTERNET_REACHABILITY',
          target: '192.168.1.130',
          reachable: false,
        },
      ],
    )

    expect(feedback.nodeStatuses['peer-terminals']).toBe('FAILURE')
  })
})
