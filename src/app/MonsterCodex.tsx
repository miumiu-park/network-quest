import { Link } from 'react-router-dom'
import type { PlayerState } from '../game'
import { SCENARIO_GUIDES } from '../scenario'
import { APP_ROUTES } from './routes'
import styles from './MonsterCodex.module.css'

interface MonsterCodexProps {
  readonly player: PlayerState
}

export function MonsterCodex({ player }: MonsterCodexProps) {
  const registeredCount = SCENARIO_GUIDES.filter((guide) =>
    player.completedScenarios.includes(guide.scenario.id),
  ).length

  return (
    <main id="center" className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Knowledge Archive</p>
          <h1>Network / Monster図鑑</h1>
          <p>倒したEnemyと獲得したNetwork Knowledgeを振り返れます。</p>
        </div>
        <p className={styles.completion} aria-label="図鑑登録数">
          <strong>{registeredCount}</strong> / {SCENARIO_GUIDES.length} 登録
        </p>
      </header>

      <ol className={styles.grid} aria-label="Monster図鑑一覧">
        {SCENARIO_GUIDES.map((guide, index) => {
          const isRegistered = player.completedScenarios.includes(
            guide.scenario.id,
          )
          const bestRank = player.bestRanks[guide.scenario.id]

          return (
            <li
              className={isRegistered ? styles.registered : styles.unknown}
              key={guide.scenario.id}
              aria-label={
                isRegistered
                  ? `${guide.scenario.enemy.name} 登録済み`
                  : `未登録Monster ${index + 1}`
              }
            >
              <div className={styles.cardHeading}>
                <span className={styles.number}>NO.{index + 1}</span>
                <span className={styles.icon} aria-hidden="true">
                  {isRegistered ? guide.icon : '？'}
                </span>
                <div>
                  <p className={styles.state}>
                    {isRegistered ? 'REGISTERED' : 'NOT DISCOVERED'}
                  </p>
                  <h2>{isRegistered ? guide.scenario.enemy.name : '???'}</h2>
                </div>
                <p className={styles.rank}>
                  <span>BEST RANK</span>
                  <strong>{isRegistered ? (bestRank ?? '—') : '?'}</strong>
                </p>
              </div>

              {isRegistered ? (
                <div className={styles.knowledge}>
                  <dl>
                    <div>
                      <dt>Learning Theme</dt>
                      <dd>{guide.learningTheme}</dd>
                    </div>
                    <div>
                      <dt>Weakness</dt>
                      <dd>{guide.scenario.failure.description}</dd>
                    </div>
                  </dl>
                  <section
                    aria-label={`${guide.scenario.enemy.name}の関連command`}
                  >
                    <h3>Related Commands</h3>
                    <div className={styles.commands}>
                      {guide.keyCommands.map((command) => (
                        <code key={command}>{command}</code>
                      ))}
                    </div>
                  </section>
                  <section
                    aria-label={`${guide.scenario.enemy.name}の学習要点`}
                  >
                    <h3>Learning Notes</h3>
                    <ul>
                      {guide.scenario.learning.keyPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </section>
                </div>
              ) : (
                <p className={styles.lockedMessage}>
                  Questをクリアすると、弱点とNetwork Knowledgeが登録されます。
                </p>
              )}
            </li>
          )
        })}
      </ol>

      <Link className={styles.returnLink} to={APP_ROUTES.village}>
        LAN Villageへ戻る
      </Link>
    </main>
  )
}
