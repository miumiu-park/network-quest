import type { BattleEngineState } from '../battle'
import styles from './BattleProgress.module.css'

const BATTLE_STEPS = [
  { id: 'investigation', label: '調査' },
  { id: 'diagnosis', label: '原因特定' },
  { id: 'repair', label: '修復' },
  { id: 'verification', label: '再確認' },
] as const

type BattleStep = (typeof BATTLE_STEPS)[number]['id']

interface BattleProgressProps {
  readonly state: BattleEngineState
}

function getCurrentBattleStep(state: BattleEngineState): BattleStep {
  if (state.repairStatus === 'REPAIRED') return 'verification'
  if (state.diagnosisStatus === 'CORRECT') return 'repair'
  if (state.investigationCount > 0) return 'diagnosis'
  return 'investigation'
}

export function BattleProgress({ state }: BattleProgressProps) {
  const currentStep = getCurrentBattleStep(state)

  return (
    <nav className={styles.progress} aria-label="Battle進行ガイド">
      <p>Quest progress</p>
      <ol>
        {BATTLE_STEPS.map((step, index) => (
          <li
            key={step.id}
            aria-current={currentStep === step.id ? 'step' : undefined}
            data-complete={
              BATTLE_STEPS.findIndex((item) => item.id === currentStep) > index
            }
          >
            <span>{index + 1}</span>
            {step.label}
          </li>
        ))}
      </ol>
    </nav>
  )
}
