import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('Subnet Golem playable Boss scenario', () => {
  it('compares peers, repairs the mask, verifies both and opens Learning Review', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/battle/subnet-golem']}>
        <App />
      </MemoryRouter>,
    )
    const terminal = screen.getByRole('textbox', { name: 'コマンド' })

    await user.type(terminal, 'ip{enter}')
    expect(
      screen.getByText(/Subnet Mask: +255\.255\.255\.128/),
    ).toBeInTheDocument()

    await user.type(terminal, 'ping 192.168.1.20{enter}')
    expect(screen.getByText(/Reply from 192\.168\.1\.20/)).toBeInTheDocument()
    await user.type(terminal, 'ping 192.168.1.130{enter}')
    expect(screen.getByText(/Request timed out/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Subnet Mask' }))
    expect(screen.getByText('Weakness Found')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Subnet Maskを修復' }))
    expect(screen.getByText('REPAIRED')).toBeInTheDocument()

    const diagram = screen.getByRole('region', { name: 'Network Diagram' })
    expect(
      within(diagram).getByText('Subnet Mask').nextElementSibling,
    ).toHaveTextContent('255.255.255.0')

    await user.type(terminal, 'ping 192.168.1.20{enter}')
    expect(screen.queryByText('Stage Clear')).not.toBeInTheDocument()
    await user.type(terminal, 'ping 192.168.1.130{enter}')
    expect(screen.getByText('Stage Clear')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Resultへ' }))
    expect(
      screen.getByRole('heading', { name: 'Subnet Golem 撃破' }),
    ).toBeInTheDocument()
    expect(screen.getByText('獲得EXP: 180')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: '学習レビューへ' }))
    expect(screen.getByRole('region', { name: '原因' })).toHaveTextContent(
      'SUBNET_MASK',
    )
  })
})
