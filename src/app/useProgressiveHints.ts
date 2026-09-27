import { useCallback, useState } from 'react'
import { createHintProgress, revealNextHint, type HintProgress } from '../game'

export interface ProgressiveHintsController {
  readonly progress: HintProgress
  readonly revealNext: () => void
}

export function useProgressiveHints(
  hints: readonly string[],
): ProgressiveHintsController {
  const [progress, setProgress] = useState(() => createHintProgress(hints))
  const revealNext = useCallback(() => {
    setProgress((current) => revealNextHint(hints, current))
  }, [hints])

  return { progress, revealNext }
}
