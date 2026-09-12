import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('Gateway Goblin playable scenario', () => {
  it('plays through investigation, gateway repair, verification and Learning', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/battle/gateway-goblin']}>
        <App />
      </MemoryRouter>,
    )
    const terminal = screen.getByRole('textbox', { name: 'コマンド' })

    expect(
      screen.getByRole('heading', { name: 'Gateway Goblin' }),
    ).toBeInTheDocument()

    await user.type(terminal, 'ip{enter}')
    expect(
      screen.getByText(/Default Gateway: 192\.168\.1\.254/),
    ).toBeInTheDocument()

    await user.type(terminal, 'ping 192.168.1.1{enter}')
    expect(screen.getByText(/Reply from 192\.168\.1\.1/)).toBeInTheDocument()

    await user.type(terminal, 'ping 203.0.113.20{enter}')
    expect(screen.getByText(/Request timed out/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Gateway' }))
    expect(screen.getByText('Weakness Found')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Default Gatewayを修復' }),
    )
    expect(screen.getByText('REPAIRED')).toBeInTheDocument()
    expect(
      screen.getByText('Default Gateway').nextElementSibling,
    ).toHaveTextContent('192.168.1.1')

    await user.type(terminal, 'ping 203.0.113.20{enter}')
    expect(screen.getByText('Stage Clear')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Resultへ' }))
    expect(
      screen.getByRole('heading', { name: 'Gateway Goblin 撃破' }),
    ).toBeInTheDocument()
    expect(screen.getByText('獲得EXP: 120')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: '学習レビューへ' }))
    expect(
      screen.getByRole('heading', { name: 'Learning Review' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '原因' })).toHaveTextContent(
      'GATEWAY',
    )
  })
})
