export interface HintProgress {
  readonly hintCount: number
  readonly revealedHints: readonly string[]
  readonly hasMoreHints: boolean
}

export function createHintProgress(hints: readonly string[]): HintProgress {
  return createSnapshot(hints, 0)
}

export function revealNextHint(
  hints: readonly string[],
  progress: HintProgress,
): HintProgress {
  if (!progress.hasMoreHints) return progress
  return createSnapshot(hints, progress.hintCount + 1)
}

function createSnapshot(
  hints: readonly string[],
  hintCount: number,
): HintProgress {
  const normalizedCount = Math.min(Math.max(0, hintCount), hints.length)
  return Object.freeze({
    hintCount: normalizedCount,
    revealedHints: Object.freeze(hints.slice(0, normalizedCount)),
    hasMoreHints: normalizedCount < hints.length,
  })
}
