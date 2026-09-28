import { useCallback, useRef, useState } from 'react'
import {
  createInitialGameState,
  recordScenarioProgress,
  unlockAchievements,
  type StageResult,
  type PlayerState,
} from '../game'
import { getScenarioGuide, SCENARIO_GUIDES } from '../scenario'
import {
  createLocalStoragePlayerProgressRepository,
  type PlayerProgressRepository,
} from '../storage'
import {
  createStageClearResult,
  matchesScenarioGuide,
  type StageClearResult,
} from './stageClearResultModel'

export interface PlayerProgressController {
  readonly player: PlayerState
  readonly recordStageResult: (result: StageResult) => StageClearResult | null
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
      if (guide === undefined || !matchesScenarioGuide(result, guide)) {
        return null
      }

      const progressResult = recordScenarioProgress(
        playerRef.current,
        result.scenarioId,
        guide.scenario.reward,
        result.rank,
      )
      const achievementResult = unlockAchievements(
        progressResult.player,
        result,
        SCENARIO_GUIDES.map((scenarioGuide) => scenarioGuide.scenario.id),
      )
      const finalPlayer = achievementResult.player
      if (finalPlayer !== playerRef.current) {
        repository.save(finalPlayer)
        playerRef.current = finalPlayer
        setPlayer(finalPlayer)
      }
      return createStageClearResult(
        result,
        { ...progressResult, player: finalPlayer },
        guide,
        achievementResult.newlyUnlocked,
      )
    },
    [repository],
  )

  return { player, recordStageResult }
}
