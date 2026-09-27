import { useCallback, useRef, useState } from 'react'
import {
  createInitialGameState,
  recordScenarioProgress,
  type ScenarioProgressResult,
  type StageResult,
  type PlayerState,
} from '../game'
import { getScenarioGuide } from '../scenario'
import {
  createLocalStoragePlayerProgressRepository,
  type PlayerProgressRepository,
} from '../storage'

export interface PlayerProgressController {
  readonly player: PlayerState
  readonly recordStageResult: (
    result: StageResult,
  ) => ScenarioProgressResult | null
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
  const playerRef = useRef(player)

  const recordStageResult = useCallback(
    (result: StageResult) => {
      const guide = getScenarioGuide(result.scenarioId)
      if (guide === undefined) return null

      const progressResult = recordScenarioProgress(
        playerRef.current,
        result.scenarioId,
        guide.scenario.reward,
        result.rank,
      )
      if (progressResult.player !== playerRef.current) {
        repository.save(progressResult.player)
        playerRef.current = progressResult.player
        setPlayer(progressResult.player)
      }
      return progressResult
    },
    [repository],
  )

  return { player, recordStageResult }
}
