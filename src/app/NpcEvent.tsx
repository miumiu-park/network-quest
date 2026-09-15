import { Link } from 'react-router-dom'
import type { Scenario } from '../scenario'
import { APP_ROUTES } from './routes'
import styles from './NpcEvent.module.css'

interface NpcEventProps {
  readonly scenario: Scenario
}

export function NpcEvent({ scenario }: NpcEventProps) {
  const event = scenario.event

  return (
    <main id="center" className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Incoming request / Area 01</p>
          <h1>NPC Event</h1>
        </div>
        <p className={styles.location}>{event.location}</p>
      </header>

      <section className={styles.eventCard} aria-labelledby="npc-name">
        <div className={styles.portrait} aria-hidden="true">
          🧙
        </div>
        <div className={styles.dialogue}>
          <p className={styles.speakerLabel}>Village Guide</p>
          <h2 id="npc-name">{event.npcName}</h2>
          <blockquote>「{event.symptom}」</blockquote>
        </div>
      </section>

      <section className={styles.mission} aria-labelledby="mission-title">
        <div>
          <p className={styles.eyebrow}>Mission update</p>
          <h2 id="mission-title">症状から通信障害を解決する</h2>
          <p>
            この症状をTerminalで調査し、原因を特定して修復し、最後に通信を再確認してください。
          </p>
        </div>
        <span className={styles.status}>NEW QUEST</span>
      </section>

      <nav className={styles.actions} aria-label="Event actions">
        <Link className={styles.secondaryAction} to={APP_ROUTES.village}>
          LAN Villageへ戻る
        </Link>
        <Link className={styles.primaryAction} to={`/battle/${scenario.id}`}>
          調査を開始
        </Link>
      </nav>
    </main>
  )
}
