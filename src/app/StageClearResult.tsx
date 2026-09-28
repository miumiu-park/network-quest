import { Link } from 'react-router-dom'
import { APP_ROUTES } from './routes'
import type { StageClearResult as StageClearResultModel } from './stageClearResultModel'
import styles from './StageClearResult.module.css'

interface StageClearResultProps {
  readonly result: StageClearResultModel
  readonly learningState: unknown
}

export function StageClearResult({
  result,
  learningState,
}: StageClearResultProps) {
  return (
    <main id="center" className={styles.screen}>
      <header className={styles.victory}>
        <p className={styles.eyebrow}>STAGE CLEAR</p>
        <h1>{result.enemyName} 撃破！</h1>
        <p className={styles.scenario}>{result.scenarioTitle}</p>
        <div className={styles.rankRow}>
          <p className={styles.rank} aria-label={`Stage Rank ${result.rank}`}>
            <span>RANK</span>
            <strong>{result.rank}</strong>
          </p>
          {result.isNewBestRank && (
            <p className={styles.record} role="status">
              NEW RECORD
            </p>
          )}
        </div>
      </header>

      <section className={styles.reward} aria-labelledby="stage-reward-title">
        <div>
          <p className={styles.sectionLabel}>Quest Reward</p>
          <h2 id="stage-reward-title">
            {result.expAwarded > 0 ? `+${result.expAwarded} EXP` : '追加EXP 0'}
          </h2>
          <p>
            {result.expAwarded > 0
              ? `初回クリア報酬 ${result.rewardExp} EXPを獲得しました。`
              : 'このQuestの初回クリア報酬は獲得済みです。再挑戦のためEXPは追加されません。'}
          </p>
        </div>
        {result.didLevelUp && (
          <div className={styles.levelUp} role="status">
            <span>LEVEL UP</span>
            <strong>
              Lv.{result.previousLevel} → Lv.{result.currentLevel}
            </strong>
          </div>
        )}
      </section>

      <dl className={styles.performance} aria-label="Stage performance">
        <div>
          <dt>Commands</dt>
          <dd>{result.performance.commandCount}</dd>
        </div>
        <div>
          <dt>Wrong Answers</dt>
          <dd>{result.performance.incorrectAnswerCount}</dd>
        </div>
        <div>
          <dt>Hints</dt>
          <dd>{result.performance.hintCount}</dd>
        </div>
      </dl>

      {result.newAchievements.length > 0 && (
        <section
          className={styles.achievements}
          aria-labelledby="achievement-unlocked-title"
          role="status"
        >
          <p className={styles.sectionLabel}>Badge acquired</p>
          <h2 id="achievement-unlocked-title">Achievement Unlocked!</h2>
          <ul>
            {result.newAchievements.map((achievement) => (
              <li key={achievement.id}>
                <span aria-hidden="true">🏅</span>
                <div>
                  <strong>{achievement.name}</strong>
                  <p>{achievement.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.learning} aria-labelledby="learned-title">
        <p className={styles.sectionLabel}>Knowledge acquired</p>
        <h2 id="learned-title">今回学んだテーマ: {result.learningTheme}</h2>
        <p>{result.learningSummary}</p>
        <div className={styles.learningGrid}>
          <div>
            <h3>Network Concepts</h3>
            <ul>
              {result.learningKeyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Key Commands</h3>
            <div className={styles.commands}>
              {result.keyCommands.map((command) => (
                <code key={command}>{command}</code>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Link
        className={styles.reviewLink}
        to={APP_ROUTES.learning}
        state={learningState}
      >
        学習レビューへ進む
      </Link>
    </main>
  )
}
