import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PlayerState } from '../game'
import { createProgressionState } from '../progression'
import { PlayerStatus } from './PlayerStatus'

describe('PlayerStatus', () => {
  it('shows the persisted Player Progress values with accessible EXP progress', () => {
    const player: PlayerState = {
      ...createProgressionState(100),
      completedScenarios: ['ip-slime'],
      unlockedCommands: [],
      bestRanks: { 'ip-slime': 'A' },
    }

    render(<PlayerStatus player={player} scenarioCount={4} />)

    expect(
      screen.getByRole('region', { name: 'Network Adventurer' }),
    ).toHaveTextContent(
      'Player StatusNetwork AdventurerLevel2Experience100 / 300 EXP次のLevelまで 200 EXPQuest Clear1 / 4',
    )
    expect(
      screen.getByRole('progressbar', { name: '次のLevelまでのEXP進捗' }),
    ).toHaveAttribute('value', '100')
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '300')
  })
})
