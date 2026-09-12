import type { BattleEngineState } from '../battle'
import styles from './BattleEffects.module.css'

interface BattleEffectsProps {
  readonly state: BattleEngineState
}

interface EffectMessage {
  readonly id: string
  readonly kind: 'success' | 'damage' | 'weakness'
  readonly label: string
  readonly detail: string
}

export function BattleEffects({ state }: BattleEffectsProps) {
  const messages: EffectMessage[] = []
  const lastInvestigation = state.lastInvestigation

  if (lastInvestigation?.effectiveness === 'EFFECTIVE') {
    messages.push({
      id: `investigation-${state.investigationCount}`,
      kind: 'success',
      label: 'Investigation Success',
      detail: '有効な調査結果を獲得',
    })
  }

  if (lastInvestigation !== null && lastInvestigation.damage > 0) {
    messages.push({
      id: `damage-${state.investigationCount}`,
      kind: 'damage',
      label: 'Enemy Damage',
      detail: `-${lastInvestigation.damage} HP`,
    })
  }

  if (state.diagnosisStatus === 'CORRECT') {
    messages.push({
      id: `weakness-${state.causeAnswerAttempts.length}`,
      kind: 'weakness',
      label: 'Weakness Found',
      detail: '原因の特定に成功',
    })
  }

  if (
    state.repairVerificationStatus === 'SUCCEEDED' &&
    lastInvestigation?.damage === 0
  ) {
    messages.push({
      id: 'damage-final',
      kind: 'damage',
      label: 'Enemy Damage',
      detail: 'FINAL BLOW',
    })
  }

  if (messages.length === 0) {
    return null
  }

  return (
    <aside
      className={styles.effects}
      aria-live="polite"
      aria-atomic="true"
      aria-label="Battle effects"
    >
      {messages.map((effect) => (
        <div
          className={`${styles.effect} ${styles[effect.kind]}`}
          key={effect.id}
        >
          <strong>{effect.label}</strong>
          <span>{effect.detail}</span>
        </div>
      ))}
    </aside>
  )
}
