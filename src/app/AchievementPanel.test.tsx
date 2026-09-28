import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AchievementPanel } from './AchievementPanel'

describe('AchievementPanel', () => {
  it('shows unlocked and locked badges from the shared definitions', () => {
    render(
      <AchievementPanel
        unlockedAchievements={['first-troubleshooter', 'no-hint']}
      />,
    )

    expect(screen.getByLabelText('Achievement解除数')).toHaveTextContent(
      '2 / 5',
    )
    expect(
      screen.getByText('First Troubleshooter').closest('li'),
    ).toHaveTextContent('UNLOCKED')
    expect(screen.getByText('No Hint').closest('li')).toHaveTextContent(
      'UNLOCKED',
    )
    expect(screen.getByText('LAN Master').closest('li')).toHaveTextContent(
      'LOCKED',
    )
  })
})
