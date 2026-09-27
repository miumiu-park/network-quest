import styles from './ProgressiveHints.module.css'
import type { ProgressiveHintsController } from './useProgressiveHints'

interface ProgressiveHintsProps extends ProgressiveHintsController {
  readonly totalHintCount: number
}

export function ProgressiveHints({
  progress,
  revealNext,
  totalHintCount,
}: ProgressiveHintsProps) {
  return (
    <section className={styles.panel} aria-labelledby="hint-title">
      <div className={styles.header}>
        <div>
          <h2 id="hint-title">Investigation Hints</h2>
          <p>
            {progress.hintCount} / {totalHintCount} stages revealed
          </p>
        </div>
        <button
          type="button"
          onClick={revealNext}
          disabled={!progress.hasMoreHints}
        >
          {progress.hasMoreHints ? '次のヒントを表示' : 'すべて表示済み'}
        </button>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {progress.revealedHints.length === 0 ? (
          <p className={styles.empty}>必要なときだけ段階的に開示できます。</p>
        ) : (
          <ol className={styles.hints}>
            {progress.revealedHints.map((hint, index) => (
              <li key={`${index}-${hint}`}>{hint}</li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
