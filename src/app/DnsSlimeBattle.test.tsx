import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('DNS Slime playable scenario', () => {
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

    await user.type(terminal, 'ping 203.0.113.20{enter}')
    expect(screen.getByText(/Reply from 203\.0\.113\.20/)).toBeInTheDocument()

    await user.type(terminal, 'nslookup quest.example{enter}')
    expect(screen.getByText(/configured DNS server/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'DNS' }))
    expect(screen.getByText(/正解です/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'DNS設定を修復' }))
    expect(screen.getByText('Repair: REPAIRED')).toBeInTheDocument()
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
      screen.getByRole('heading', { name: 'Learning' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/IP到達性と名前解決を順番に確認/),
    ).toBeInTheDocument()
  })
})
