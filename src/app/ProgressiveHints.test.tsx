import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ProgressiveHints } from './ProgressiveHints'
import { useProgressiveHints } from './useProgressiveHints'

const hints = [
  'まずIP到達性を確認する',
  '成功範囲を比較する',
  '機能を切り分ける',
]

function TestHints() {
  const controller = useProgressiveHints(hints)
  return <ProgressiveHints {...controller} totalHintCount={hints.length} />
}

describe('ProgressiveHints', () => {
  it('reveals scenario hints one stage at a time and stops at the maximum', async () => {
    const user = userEvent.setup()
    render(<TestHints />)

    expect(screen.queryByText(hints[0])).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '次のヒントを表示' }))
    expect(screen.getByText(hints[0])).toBeInTheDocument()
    expect(screen.queryByText(hints[1])).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '次のヒントを表示' }))
    await user.click(screen.getByRole('button', { name: '次のヒントを表示' }))
    expect(screen.getByText(hints[2])).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'すべて表示済み' }),
    ).toBeDisabled()
  })
})
