import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Terminal, type TerminalExecutor } from './Terminal'

describe('Terminal', () => {
  it('executes a normalized command and displays its output in history', async () => {
    const user = userEvent.setup()
    const execute = vi.fn<TerminalExecutor>(() => ({
      kind: 'output',
      text: 'gateway is reachable',
    }))
    render(<Terminal execute={execute} />)

    await user.type(
      screen.getByRole('textbox', { name: 'コマンド' }),
      '  ping gateway  ',
    )
    await user.click(screen.getByRole('button', { name: '実行' }))

    expect(execute).toHaveBeenCalledWith({
      command: 'ping',
      args: ['gateway'],
    })
    expect(screen.getByText('ping gateway')).toBeInTheDocument()
    expect(screen.getByText('gateway is reachable')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'コマンド' })).toHaveValue('')
  })

  it('keeps previous commands and identifies execution errors', async () => {
    const user = userEvent.setup()
    const execute = vi
      .fn<TerminalExecutor>()
      .mockReturnValueOnce({ kind: 'output', text: 'first result' })
      .mockReturnValueOnce({ kind: 'error', text: 'unknown command' })
    render(<Terminal execute={execute} />)
    const input = screen.getByRole('textbox', { name: 'コマンド' })

    await user.type(input, 'ping gateway{enter}')
    await user.type(input, 'whoami{enter}')

    expect(screen.getByText('first result')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('unknown command')
    expect(execute).toHaveBeenCalledTimes(2)
  })

  it('rejects an empty command without invoking the executor', async () => {
    const user = userEvent.setup()
    const execute = vi.fn<TerminalExecutor>()
    render(<Terminal execute={execute} />)

    await user.type(screen.getByRole('textbox', { name: 'コマンド' }), '   ')
    await user.click(screen.getByRole('button', { name: '実行' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'コマンドを入力してください。',
    )
    expect(execute).not.toHaveBeenCalled()
  })

  it('does not pass invalid syntax to the executor', async () => {
    const user = userEvent.setup()
    const execute = vi.fn<TerminalExecutor>()
    render(<Terminal execute={execute} />)

    await user.type(
      screen.getByRole('textbox', { name: 'コマンド' }),
      'ping gateway;reboot',
    )
    await user.click(screen.getByRole('button', { name: '実行' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      '引数「gateway;reboot」の形式が正しくありません。',
    )
    expect(execute).not.toHaveBeenCalled()
  })
})
