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
    expect(
      screen.getByRole('button', { name: /Gateway Goblin/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /IP Slime/ })).toBeInTheDocument()
  })

  it('opens the NPC request by default', () => {
    renderVillage()

    expect(screen.getByRole('button', { name: /Net Sage/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByRole('link', { name: 'IP Slimeから始める' }),
    ).toHaveAttribute('href', '/event/ip-slime')
  })

  it('shows the game loop and beginner recommendation metadata', async () => {
    const user = userEvent.setup()
    renderVillage()

    expect(
      screen.getByRole('region', { name: 'Network Questの進め方' }),
    ).toHaveTextContent(
      /症状を確認.*Terminalで調査.*原因を特定.*設定を修復.*通信を再確認.*Learning Review/,
    )
    expect(screen.getByText('次におすすめ')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /IP Slime/ }))
    expect(screen.getByText('学習テーマ').nextElementSibling).toHaveTextContent(
      'Host Addressing',
    )
    expect(screen.getByText('難易度').nextElementSibling).toHaveTextContent(
      '初級',
    )
  })

  it('derives clear and next-recommendation status from completed scenarios', () => {
    render(
      <MemoryRouter>
        <LanVillage completedScenarios={['ip-slime']} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /IP Slime/ })).toHaveTextContent(
      'クリア済み',
    )
    expect(
      screen.getByRole('button', { name: /Gateway Goblin/ }),
    ).toHaveTextContent('次におすすめ')
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

  it('opens the Subnet Golem Boss request from its selected node', async () => {
    const user = userEvent.setup()
    renderVillage()
    const golem = screen.getByRole('button', { name: /Subnet Golem/ })

    await user.click(golem)

    expect(golem).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('link', { name: 'Boss依頼を確認' }),
    ).toHaveAttribute('href', '/event/subnet-golem')
  })

  it('opens the Gateway Goblin request from its selected node', async () => {
    const user = userEvent.setup()
    renderVillage()

    await user.click(screen.getByRole('button', { name: /Gateway Goblin/ }))

    expect(
      screen.getByRole('heading', { name: 'Gateway Goblin' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '依頼を確認' })).toHaveAttribute(
      'href',
      '/event/gateway-goblin',
    )
  })

  it('opens the IP Slime request from its selected node', async () => {
    const user = userEvent.setup()
    renderVillage()

    await user.click(screen.getByRole('button', { name: /IP Slime/ }))

    expect(
      screen.getByRole('heading', { name: 'IP Slime' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '依頼を確認' })).toHaveAttribute(
      'href',
      '/event/ip-slime',
    )
  })
})
