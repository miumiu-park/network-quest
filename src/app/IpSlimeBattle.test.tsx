import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('IP Slime playable scenario', () => {
  it('completes investigation, repair, verification and Learning Review', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/battle/ip-slime']}>
        <App />
      </MemoryRouter>,
    )
    const terminal = screen.getByRole('textbox', { name: 'コマンド' })

    await user.type(terminal, 'ip{enter}')
    expect(screen.getByText(/IP Address: +192\.168\.2\.10/)).toBeInTheDocument()

    await user.type(terminal, 'ping gateway{enter}')
    expect(screen.getByText(/Request timed out/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'IP Address' }))
    expect(screen.getByText('Weakness Found')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'IP Addressを修復' }))
    expect(screen.getByText('REPAIRED')).toBeInTheDocument()
    const networkDiagram = screen.getByRole('region', {
      name: 'Network Diagram',
    })
    expect(
      within(networkDiagram).getByText('IP Address').nextElementSibling,
    ).toHaveTextContent('192.168.1.10')

    await user.type(terminal, 'ping gateway{enter}')
    expect(screen.getByText('Stage Clear')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Resultへ' }))
    expect(
      screen.getByRole('heading', { name: 'IP Slime 撃破' }),
    ).toBeInTheDocument()
    expect(screen.getByText('獲得EXP: 100')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: '学習レビューへ' }))
    expect(
      screen.getByRole('heading', { name: 'Learning Review' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '原因' })).toHaveTextContent(
      'IP_ADDRESS',
    )
  })
})
