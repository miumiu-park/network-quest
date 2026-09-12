import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createBattleEngine } from '../battle'
import { BattleEffects } from './BattleEffects'

const engine = createBattleEngine({
  enemyMaxHp: 100,
  effectiveInvestigationDamage: 30,
  correctCause: 'DNS',
})

describe('Battle effects', () => {
  it('announces investigation success and enemy damage without blocking controls', () => {
    const initialState = engine.createInitialState()
    const { rerender } = render(<BattleEffects state={initialState} />)

    rerender(
      <BattleEffects state={engine.investigate(initialState, 'EFFECTIVE')} />,
    )

    const effects = screen.getByRole('complementary', {
      name: 'Battle effects',
    })
    expect(effects).toHaveTextContent('Investigation Success')
    expect(effects).toHaveTextContent('Enemy Damage-30 HP')
  })

  it('announces a discovered weakness', () => {
    const initialState = engine.createInitialState()
    const { rerender } = render(<BattleEffects state={initialState} />)

    rerender(
      <BattleEffects state={engine.submitCauseAnswer(initialState, 'DNS')} />,
    )
    expect(screen.getByText('Weakness Found')).toBeInTheDocument()
  })
})
