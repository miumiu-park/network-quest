import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createInitialGameState } from '../game'
import { MonsterCodex } from './MonsterCodex'

describe('MonsterCodex', () => {
  it('hides Enemy identity and solution details for incomplete scenarios', () => {
    render(
      <MemoryRouter>
        <MonsterCodex player={createInitialGameState().player} />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('図鑑登録数')).toHaveTextContent('0 / 4 登録')
    expect(
      screen.getAllByRole('listitem', { name: /未登録Monster/ }),
    ).toHaveLength(4)
    expect(screen.queryByText('DNS Slime')).not.toBeInTheDocument()
    expect(screen.queryByText('Name Resolution')).not.toBeInTheDocument()
    expect(screen.queryByText(/DNS設定/)).not.toBeInTheDocument()
  })

  it('shows catalog knowledge, related commands and Best Rank only after clear', () => {
    render(
      <MemoryRouter>
        <MonsterCodex
          player={{
            ...createInitialGameState().player,
            completedScenarios: ['dns-slime'],
            bestRanks: { 'dns-slime': 'A' },
          }}
        />
      </MemoryRouter>,
    )

    const entry = screen.getByRole('listitem', {
      name: 'DNS Slime 登録済み',
    })
    expect(screen.getByLabelText('図鑑登録数')).toHaveTextContent('1 / 4 登録')
    expect(entry).toHaveTextContent('Name Resolution')
    expect(entry).toHaveTextContent('BEST RANKA')
    expect(
      within(entry).getByRole('region', { name: 'DNS Slimeの関連command' }),
    ).toHaveTextContent('ippingnslookup')
    expect(
      within(entry).getByRole('region', { name: 'DNS Slimeの学習要点' }),
    ).toHaveTextContent('nslookupでDNS名前解決')
    expect(
      screen.getAllByRole('listitem', { name: /未登録Monster/ }),
    ).toHaveLength(3)
  })

  it('provides a route back to LAN Village', () => {
    render(
      <MemoryRouter>
        <MonsterCodex player={createInitialGameState().player} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'LAN Villageへ戻る' }),
    ).toHaveAttribute('href', '/village')
  })
})
