import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DNS_SLIME_SCENARIO } from '../scenario'
import { NpcEvent } from './NpcEvent'

function renderEvent() {
  return render(
    <MemoryRouter>
      <NpcEvent scenario={DNS_SLIME_SCENARIO} />
    </MemoryRouter>,
  )
}

describe('NPC Event', () => {
  it('shows only the observable symptom in the NPC dialogue', () => {
    renderEvent()

    expect(
      screen.getByRole('heading', { name: 'Net Sage' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/quest\.example/)).toHaveTextContent(
      DNS_SLIME_SCENARIO.event.symptom,
    )
    expect(document.body).not.toHaveTextContent(
      /DNS|名前解決|設定|ping|nslookup/i,
    )
  })

  it('offers navigation back to the Village and forward to Battle', () => {
    renderEvent()

    expect(
      screen.getByRole('link', { name: 'LAN Villageへ戻る' }),
    ).toHaveAttribute('href', '/village')
    expect(screen.getByRole('link', { name: '調査を開始' })).toHaveAttribute(
      'href',
      '/battle/dns-slime',
    )
  })
})
