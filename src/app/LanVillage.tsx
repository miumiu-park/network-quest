import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DNS_SLIME_SCENARIO } from '../scenario'
import styles from './LanVillage.module.css'

const VILLAGE_ENTITIES = [
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
      'Villageで起きている異変について、相談したいことがあるようです。',
  },
  {
    id: 'dns-slime',
    name: 'DNS Slime',
    role: 'Name Resolution',
    icon: '🦠',
    status: 'BATTLE',
    description: '名前解決を妨害しているモンスター。調査可能です。',
  },
  {
    id: 'subnet-golem',
    name: 'Subnet Golem',
    role: 'Subnetting',
    icon: '🗿',
    status: 'COMING SOON',
    description: 'Subnetの境界を守るゴーレム。現在は準備中です。',
  },
] as const

type VillageEntityId = (typeof VILLAGE_ENTITIES)[number]['id']

export function LanVillage() {
  const [selectedId, setSelectedId] = useState<VillageEntityId>('npc')
  const selected =
    VILLAGE_ENTITIES.find((entity) => entity.id === selectedId) ??
    VILLAGE_ENTITIES[0]

  return (
    <main id="center" className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Quest Hub / Area 01</p>
          <h1>LAN Village</h1>
          <p>住人やモンスターを選んで、次の行動を決めてください。</p>
        </div>
        <div className={styles.connection}>
          <span aria-hidden="true" />
          Network Online
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.map} aria-label="LAN Village map">
          <div className={styles.mapLabel}>
            <span>192.168.1.0/24</span>
            <span>4 nodes</span>
          </div>
          <div className={styles.nodes}>
            {VILLAGE_ENTITIES.map((entity) => (
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
                <span className={styles.nodeStatus}>{entity.status}</span>
              </button>
            ))}
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
            <div>
              <dt>Status</dt>
              <dd>{selected.status}</dd>
            </div>
            <div>
              <dt>Node ID</dt>
              <dd>{selected.id}</dd>
            </div>
          </dl>

          {(selected.id === 'npc' || selected.id === 'dns-slime') && (
            <Link
              className={styles.primaryAction}
              to={`/event/${DNS_SLIME_SCENARIO.id}`}
            >
              {selected.id === 'npc' ? '症状を聞く' : '依頼を確認'}
            </Link>
          )}
          {selected.id === 'subnet-golem' && (
            <p className={styles.unavailable}>このQuestは現在準備中です。</p>
          )}
        </aside>
      </div>
    </main>
  )
}
