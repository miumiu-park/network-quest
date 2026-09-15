import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createBattleEngine } from '../battle'
import { BattleProgress } from './BattleProgress'

const engine = createBattleEngine({
  enemyMaxHp: 100,
  effectiveInvestigationDamage: 30,
  correctCause: 'DNS',
})

describe('BattleProgress', () => {
  it('derives the current guide step from Battle Engine state', () => {
    const { rerender } = render(
      <BattleProgress state={engine.createInitialState()} />,
    )
    expect(screen.getByText('調査').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )

    const investigated = engine.investigate(
      engine.createInitialState(),
      'EFFECTIVE',
    )
    rerender(<BattleProgress state={investigated} />)
    expect(screen.getByText('原因特定').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )

    const diagnosed = engine.submitCauseAnswer(investigated, 'DNS')
    rerender(<BattleProgress state={diagnosed} />)
    expect(screen.getByText('修復').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )

    rerender(<BattleProgress state={engine.recordRepair(diagnosed)} />)
    expect(screen.getByText('再確認').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )
  })
})
