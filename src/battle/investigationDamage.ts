import type { InvestigationObservation } from '../investigation'
import type { BattleEngine, BattleEngineState } from './battleEngine'

export type ObservationEffectivenessEvaluator = (
  observation: InvestigationObservation,
) => boolean

export function applyInvestigationObservations(
  engine: Pick<BattleEngine, 'investigate'>,
  state: BattleEngineState,
  observations: readonly InvestigationObservation[],
  isEffective: ObservationEffectivenessEvaluator,
): BattleEngineState {
  if (observations.length === 0) {
    return state
  }

  const effectiveness = observations.some(isEffective)
    ? 'EFFECTIVE'
    : 'INEFFECTIVE'

  return engine.investigate(state, effectiveness)
}
