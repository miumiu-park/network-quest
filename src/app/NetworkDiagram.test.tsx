import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DNS_SLIME_SCENARIO } from '../scenario'
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
})
