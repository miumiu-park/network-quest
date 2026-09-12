import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('DNS Slime playable scenario', () => {
  it('separates Enemy, Network Diagram and Terminal into operable panes', () => {
    render(
      <MemoryRouter initialEntries={['/battle/dns-slime']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('region', { name: 'Enemy' })).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Network Diagram' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Terminal' })).toBeInTheDocument()
    expect(screen.getByText('Client DNS').nextElementSibling).toHaveTextContent(
      '192.168.1.99',
    )
    expect(screen.getByRole('textbox', { name: 'コマンド' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'DNS' })).toBeEnabled()
  })

  it('plays through investigation, repair, verification, Result and Learning', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/battle/dns-slime']}>
        <App />
      </MemoryRouter>,
    )
    const terminal = screen.getByRole('textbox', { name: 'コマンド' })

    await user.type(terminal, 'ping gateway{enter}')
    expect(screen.getByText(/Reply from 192\.168\.1\.1/)).toBeInTheDocument()
    expect(screen.getByText('Investigation Success')).toBeInTheDocument()
    expect(screen.getByText('Enemy Damage')).toBeInTheDocument()

    await user.type(terminal, 'ping 203.0.113.20{enter}')
    expect(screen.getByText(/Reply from 203\.0\.113\.20/)).toBeInTheDocument()

    await user.type(terminal, 'nslookup quest.example{enter}')
    expect(screen.getByText(/configured DNS server/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'DNS' }))
    expect(screen.getByText(/正解です/)).toBeInTheDocument()
    expect(screen.getByText('Weakness Found')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'DNS設定を修復' }))
    expect(screen.getByText('REPAIRED')).toBeInTheDocument()
    expect(screen.getByText('Client DNS').nextElementSibling).toHaveTextContent(
      '192.168.1.53',
    )
    expect(screen.queryByText('Stage Clear')).not.toBeInTheDocument()

    await user.type(terminal, 'nslookup quest.example{enter}')
    expect(screen.getByText('Stage Clear')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'DNS Slime 撃破！' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Resultへ' }))
    expect(screen.getByRole('heading', { name: 'Result' })).toBeInTheDocument()
    expect(screen.getByText('獲得EXP: 100')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: '学習レビューへ' }))
    expect(
      screen.getByRole('heading', { name: 'Learning Review' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '症状' })).toHaveTextContent(
      'DNS Slimeの名前解決障害',
    )
    expect(screen.getByRole('region', { name: '原因' })).toHaveTextContent(
      'DNS',
    )
    expect(
      screen.getByRole('region', { name: '使用command' }),
    ).toHaveTextContent('pingnslookup')
    const playerSteps = screen.getByRole('region', {
      name: 'あなたの調査手順',
    })
    expect(
      [...playerSteps.querySelectorAll('code')].map(
        (command) => command.textContent,
      ),
    ).toEqual([
      'ping gateway',
      'ping 203.0.113.20',
      'nslookup quest.example',
      'nslookup quest.example',
    ])
    expect(screen.getByRole('region', { name: '推奨手順' })).toHaveTextContent(
      'gatewayへのping',
    )
    expect(
      screen.getByRole('region', { name: '原因を特定できた理由' }),
    ).toHaveTextContent(/IP到達性と名前解決を順番に確認/)
  })
})
