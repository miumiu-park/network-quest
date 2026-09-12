import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LanVillage } from './LanVillage'

function renderVillage() {
  return render(
    <MemoryRouter>
      <LanVillage />
    </MemoryRouter>,
  )
}

describe('LAN Village', () => {
  it('shows every Village character as a selectable node', () => {
    renderVillage()

    expect(screen.getByRole('button', { name: /Player/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Net Sage/ })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /DNS Slime/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Subnet Golem/ }),
    ).toBeInTheDocument()
  })

  it('opens the NPC request by default', () => {
    renderVillage()

    expect(screen.getByRole('button', { name: /Net Sage/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('link', { name: '症状を聞く' })).toHaveAttribute(
      'href',
      '/event/dns-slime',
    )
  })

  it('routes the selected monster through its request before Battle', async () => {
    const user = userEvent.setup()
    renderVillage()

    await user.click(screen.getByRole('button', { name: /DNS Slime/ }))

    expect(
      screen.getByRole('heading', { name: 'DNS Slime' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '依頼を確認' })).toHaveAttribute(
      'href',
      '/event/dns-slime',
    )
  })

  it('keeps Subnet Golem selectable while marking its quest unavailable', async () => {
    const user = userEvent.setup()
    renderVillage()
    const golem = screen.getByRole('button', { name: /Subnet Golem/ })

    await user.click(golem)

    expect(golem).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('このQuestは現在準備中です。')).toBeInTheDocument()
  })
})
