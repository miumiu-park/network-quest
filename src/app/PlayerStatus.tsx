import type { PlayerState } from '../game'
import styles from './PlayerStatus.module.css'

interface PlayerStatusProps {
  readonly player: PlayerState
  readonly scenarioCount: number
}

export function PlayerStatus({ player, scenarioCount }: PlayerStatusProps) {
  const remainingExp = player.nextLevelExp - player.exp

  return (
    <section className={styles.status} aria-labelledby="player-status-title">
      <div className={styles.identity}>
        <p>Player Status</p>
        <h2 id="player-status-title">Network Adventurer</h2>
      </div>
      <dl className={styles.metric}>
        <dt>Level</dt>
        <dd>{player.level}</dd>
      </dl>
      <dl className={styles.metric}>
        <dt>Experience</dt>
        <dd>
          {player.exp} / {player.nextLevelExp} EXP
        </dd>
        <progress
          className={styles.expProgress}
          aria-label="次のLevelまでのEXP進捗"
          value={player.exp}
          max={player.nextLevelExp}
        />
        <p className={styles.remaining}>次のLevelまで {remainingExp} EXP</p>
      </dl>
      <dl className={styles.metric}>
        <dt>Quest Clear</dt>
        <dd>
          {player.completedScenarios.length} / {scenarioCount}
        </dd>
      </dl>
    </section>
  )
}
