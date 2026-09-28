import { ACHIEVEMENTS, type AchievementId } from '../game'
import styles from './AchievementPanel.module.css'

interface AchievementPanelProps {
  readonly unlockedAchievements: readonly AchievementId[]
}

export function AchievementPanel({
  unlockedAchievements,
}: AchievementPanelProps) {
  const unlocked = new Set(unlockedAchievements)

  return (
    <section className={styles.panel} aria-labelledby="achievements-title">
      <header>
        <div>
          <p>Player Badges</p>
          <h2 id="achievements-title">Achievements</h2>
        </div>
        <strong aria-label="Achievement解除数">
          {unlocked.size} / {ACHIEVEMENTS.length}
        </strong>
      </header>
      <ul>
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlocked.has(achievement.id)
          return (
            <li
              className={isUnlocked ? styles.unlocked : styles.locked}
              key={achievement.id}
            >
              <span aria-hidden="true">{isUnlocked ? '🏅' : '🔒'}</span>
              <div>
                <strong>{achievement.name}</strong>
                <p>{achievement.description}</p>
                <small>{isUnlocked ? 'UNLOCKED' : 'LOCKED'}</small>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
