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

  it('opens the existing DNS Slime quest from the selected node', () => {
    renderVillage()

    expect(screen.getByRole('button', { name: /DNS Slime/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByRole('link', { name: 'DNS Slimeに挑戦' }),
    ).toHaveAttribute('href', '/battle/dns-slime')
  })

  it('updates the detail panel when the NPC is selected', async () => {
    const user = userEvent.setup()
    renderVillage()

    await user.click(screen.getByRole('button', { name: /Net Sage/ }))

    expect(
      screen.getByRole('heading', { name: 'Net Sage' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/近い場所から順番に到達性/)).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'DNS Slimeに挑戦' }),
    ).not.toBeInTheDocument()
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
