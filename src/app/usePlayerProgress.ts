import { useCallback, useState } from 'react'
import {
  completeScenarioProgress,
  createInitialGameState,
  type PlayerState,
  type ScenarioId,
} from '../game'
import { getScenarioGuide } from '../scenario'
import {
  createLocalStoragePlayerProgressRepository,
  type PlayerProgressRepository,
} from '../storage'

export interface PlayerProgressController {
  readonly player: PlayerState
  readonly completeScenario: (scenarioId: ScenarioId) => void
}

export function usePlayerProgress(
  providedRepository?: PlayerProgressRepository,
): PlayerProgressController {
  const [repository] = useState(
    () => providedRepository ?? createLocalStoragePlayerProgressRepository(),
  )
  const [player, setPlayer] = useState(
    () => repository.load() ?? createInitialGameState().player,
  )

  const completeScenario = useCallback(
    (scenarioId: ScenarioId) => {
      const guide = getScenarioGuide(scenarioId)
      if (guide === undefined) return

      setPlayer((currentPlayer) => {
        const nextPlayer = completeScenarioProgress(
          currentPlayer,
          scenarioId,
          guide.scenario.reward,
        )
        if (nextPlayer === currentPlayer) return currentPlayer

        repository.save(nextPlayer)
        return nextPlayer
      })
    },
    [repository],
  )

  return { player, completeScenario }
}
