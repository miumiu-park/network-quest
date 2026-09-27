import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DNS_SLIME_SCENARIO } from '../scenario'
import { createNetworkDiagramFeedback } from '../investigation'
import { NetworkDiagram } from './NetworkDiagram'

describe('Network Diagram', () => {
  it('renders Scenario topology without deriving network judgments', () => {
    render(
      <NetworkDiagram
        topology={DNS_SLIME_SCENARIO.topology}
        details={[
          { label: 'Client DNS', value: '192.168.1.99' },
          { label: 'Subnet', value: '255.255.255.0' },
        ]}
      />,
    )

    const path = screen.getByRole('list', { name: 'Main network path' })
    expect(
      within(path)
        .getAllByRole('listitem')
        .map((node) => node.textContent),
    ).toEqual([
      'PC192.168.1.10',
      'SwitchLAN / Layer 2',
      'Router192.168.1.1',
      'Internet203.0.113.20',
    ])
    expect(
      screen.getByRole('complementary', { name: 'DNS branch' }),
    ).toHaveTextContent('Switch → DNS queryDNS192.168.1.53')
    expect(screen.queryByText(/ONLINE|OFFLINE|LINK UP/)).not.toBeInTheDocument()
  })

  it('renders projected success, failure and uninvestigated states with text', () => {
    const feedback = createNetworkDiagramFeedback(DNS_SLIME_SCENARIO.topology, [
      {
        kind: 'GATEWAY_REACHABILITY',
        target: 'gateway',
        reachable: true,
      },
      {
        kind: 'DNS_RESOLUTION',
        hostname: 'quest.example',
        resolved: false,
      },
    ])

    render(
      <NetworkDiagram
        topology={DNS_SLIME_SCENARIO.topology}
        details={[]}
        feedback={feedback}
      />,
    )

    const results = screen.getByRole('region', {
      name: '通信経路の調査結果',
    })
    expect(results).toHaveTextContent(/Gateway \(gateway\): 通信成功/)
    expect(results).toHaveTextContent(/DNS \(quest\.example\): 通信失敗/)
    expect(screen.getByText('Router').closest('article')).toHaveAttribute(
      'data-communication-status',
      'SUCCESS',
    )
    expect(screen.getByText('DNS').closest('article')).toHaveAttribute(
      'data-communication-status',
      'FAILURE',
    )
    expect(screen.getByText('Internet').closest('article')).toHaveTextContent(
      '未調査',
    )
  })
})
