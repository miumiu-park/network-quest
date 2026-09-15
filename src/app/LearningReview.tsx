import { Link } from 'react-router-dom'
import type { LearningReview as LearningReviewModel } from '../learning'
import {
  getNextRecommendedScenario,
  getScenarioGuide,
  type ScenarioId,
} from '../scenario'
import { APP_ROUTES } from './routes'
import styles from './LearningReview.module.css'

interface LearningReviewProps {
  readonly review: LearningReviewModel
  readonly completedScenarios?: readonly ScenarioId[]
}

export function LearningReview({
  review,
  completedScenarios = [],
}: LearningReviewProps) {
  const currentGuide = getScenarioGuide(review.scenarioId)
  const completedWithCurrent = [
    ...new Set([...completedScenarios, review.scenarioId]),
  ]
  const nextGuide = getNextRecommendedScenario(completedWithCurrent)

  return (
    <main id="center" className={styles.screen}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Scenario: {review.scenarioId}</p>
        <h1>Learning Review</h1>
        <p>今回の調査を振り返り、次の障害対応へつなげましょう。</p>
      </header>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="review-symptom">
          <h2 id="review-symptom">症状</h2>
          <p>{review.symptom}</p>
        </section>

        <section className={styles.card} aria-labelledby="review-cause">
          <h2 id="review-cause">原因</h2>
          <p className={styles.causeType}>{review.cause.type}</p>
          <p>{review.cause.description}</p>
        </section>

        <section className={styles.card} aria-labelledby="review-commands">
          <h2 id="review-commands">使用command</h2>
          <div className={styles.commands}>
            {review.usedCommands.map((command) => (
              <code key={command}>{command}</code>
            ))}
          </div>
        </section>

        <section className={styles.card} aria-labelledby="review-reasoning">
          <h2 id="review-reasoning">原因を特定できた理由</h2>
          <p>{review.reasoning}</p>
        </section>
      </div>

      <section className={styles.steps} aria-labelledby="review-player-steps">
        <h2 id="review-player-steps">あなたの調査手順</h2>
        <ol>
          {review.investigationSteps.map((step, index) => (
            <li key={`${index}-${step.command}`}>
              <code>{step.command}</code>
              <span>{step.result}</span>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={styles.steps}
        aria-labelledby="review-recommended-steps"
      >
        <h2 id="review-recommended-steps">推奨手順</h2>
        <ol>
          {review.recommendedSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className={styles.nextAction} aria-labelledby="next-action">
        <div>
          <p className={styles.eyebrow}>Quest complete</p>
          <h2 id="next-action">次の行動</h2>
          <p>
            今回クリア: {currentGuide?.scenario.enemy.name ?? review.scenarioId}
          </p>
          {nextGuide === null ? (
            <p>全Scenarioをクリアしました。Villageで達成状況を確認できます。</p>
          ) : (
            <p>
              次におすすめ: {nextGuide.scenario.enemy.name}（
              {nextGuide.learningTheme} / {nextGuide.difficulty}）
            </p>
          )}
        </div>
        <div className={styles.nextLinks}>
          <Link className={styles.returnLink} to={APP_ROUTES.village}>
            LAN Villageへ戻る
          </Link>
          {nextGuide !== null && (
            <Link
              className={styles.nextLink}
              to={`/event/${nextGuide.scenario.id}`}
            >
              次の依頼を確認
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}
