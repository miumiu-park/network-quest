import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SCENARIO_GUIDES,
  getNextRecommendedScenario,
  getScenarioGuide,
  type ScenarioId,
} from '../scenario'
import styles from './LanVillage.module.css'

interface LanVillageProps {
  readonly completedScenarios?: readonly ScenarioId[]
}

interface VillageEntity {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly icon: string
  readonly status: string
  readonly description: string
  readonly scenarioId?: ScenarioId
}

const VILLAGE_ENTITIES: readonly VillageEntity[] = [
  {
    id: 'player',
    name: 'Player',
    role: 'Network Adventurer',
    icon: '🧭',
    status: 'READY',
    description: 'Terminalを手に、LAN Villageの障害を調査する冒険者です。',
  },
  {
    id: 'npc',
    name: 'Net Sage',
    role: 'Village Guide',
    icon: '🧙',
    status: 'TALK',
    description:
      '症状を聞き、Terminalで調査してVillageの通信障害を解決しましょう。',
  },
  ...SCENARIO_GUIDES.map((guide) => ({
    id: guide.scenario.id,
    scenarioId: guide.scenario.id,
    name: guide.scenario.enemy.name,
    role: guide.learningTheme,
    icon: guide.icon,
    status: guide.encounter,
    description: guide.scenario.title,
  })),
]

export function LanVillage({ completedScenarios = [] }: LanVillageProps) {
  const [selectedId, setSelectedId] = useState('npc')
  const selected =
    VILLAGE_ENTITIES.find((entity) => entity.id === selectedId) ??
    VILLAGE_ENTITIES[0]
  const selectedGuide =
    selected.scenarioId === undefined
      ? undefined
      : getScenarioGuide(selected.scenarioId)
  const nextRecommended = getNextRecommendedScenario(completedScenarios)
  const selectedIsComplete =
    selected.scenarioId !== undefined &&
    completedScenarios.includes(selected.scenarioId)
  const selectedIsNext =
    selected.scenarioId !== undefined &&
    nextRecommended?.scenario.id === selected.scenarioId
  const actionGuide =
    selected.id === 'npc' ? nextRecommended : (selectedGuide ?? null)

  return (
    <main id="center" className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Quest Hub / Area 01</p>
          <h1>LAN Village</h1>
          <p>通信障害を調査し、原因を見つけて修復するQuest Hubです。</p>
        </div>
        <div className={styles.connection}>
          <span aria-hidden="true" />
          Network Online
        </div>
      </header>

      <section className={styles.onboarding} aria-labelledby="quest-loop-title">
        <div>
          <p className={styles.eyebrow}>How to play</p>
          <h2 id="quest-loop-title">Network Questの進め方</h2>
        </div>
        <ol>
          {[
            '症状を確認',
            'Terminalで調査',
            '原因を特定',
            '設定を修復',
            '通信を再確認',
            'Learning Review',
          ].map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.layout}>
        <section className={styles.map} aria-label="LAN Village map">
          <div className={styles.mapLabel}>
            <span>192.168.1.0/24</span>
            <span>おすすめ順に挑戦 / 全Quest選択可能</span>
          </div>
          <div className={styles.nodes}>
            {VILLAGE_ENTITIES.map((entity) => {
              const guide =
                entity.scenarioId === undefined
                  ? undefined
                  : getScenarioGuide(entity.scenarioId)
              const isComplete =
                entity.scenarioId !== undefined &&
                completedScenarios.includes(entity.scenarioId)
              const isNext =
                entity.scenarioId !== undefined &&
                nextRecommended?.scenario.id === entity.scenarioId

              return (
                <button
                  className={styles.node}
                  data-entity={entity.id}
                  type="button"
                  key={entity.id}
                  aria-pressed={selected.id === entity.id}
                  onClick={() => setSelectedId(entity.id)}
                >
                  <span className={styles.icon} aria-hidden="true">
                    {entity.icon}
                  </span>
                  <span className={styles.nodeText}>
                    <strong>{entity.name}</strong>
                    <small>{entity.role}</small>
                  </span>
                  <span className={styles.nodeBadges}>
                    <span className={styles.nodeStatus}>{entity.status}</span>
                    {guide !== undefined && (
                      <span className={styles.progressStatus}>
                        {isComplete ? 'クリア済み' : '未挑戦'}
                      </span>
                    )}
                    {isNext && (
                      <span className={styles.recommended}>次におすすめ</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <aside className={styles.details} aria-live="polite">
          <p className={styles.detailsLabel}>Selected node</p>
          <div className={styles.detailsTitle}>
            <span aria-hidden="true">{selected.icon}</span>
            <div>
              <h2>{selected.name}</h2>
              <p>{selected.role}</p>
            </div>
          </div>
          <p className={styles.description}>{selected.description}</p>

          <dl className={styles.metadata}>
            {selectedGuide === undefined ? (
              <div>
                <dt>Status</dt>
                <dd>{selected.status}</dd>
              </div>
            ) : (
              <>
                <div>
                  <dt>学習テーマ</dt>
                  <dd>{selectedGuide.learningTheme}</dd>
                </div>
                <div>
                  <dt>難易度</dt>
                  <dd>{selectedGuide.difficulty}</dd>
                </div>
                <div>
                  <dt>進捗</dt>
                  <dd>{selectedIsComplete ? 'クリア済み' : '未挑戦'}</dd>
                </div>
                <div>
                  <dt>おすすめ順</dt>
                  <dd>
                    #{SCENARIO_GUIDES.indexOf(selectedGuide) + 1}
                    {selectedIsNext ? ' / NEXT' : ''}
                  </dd>
                </div>
              </>
            )}
          </dl>

          {actionGuide !== null && (
            <Link
              className={styles.primaryAction}
              to={`/event/${actionGuide.scenario.id}`}
            >
              {selected.id === 'npc'
                ? `${actionGuide.scenario.enemy.name}から始める`
                : selected.status === 'BOSS'
                  ? 'Boss依頼を確認'
                  : '依頼を確認'}
            </Link>
          )}
          {selected.id === 'npc' && nextRecommended === null && (
            <p className={styles.allClear}>全Scenarioクリア済みです！</p>
          )}
        </aside>
      </div>
    </main>
  )
}
