import type { ScenarioTopology, ScenarioTopologyNode } from '../scenario'
import type {
  CommunicationStatus,
  NetworkDiagramFeedback,
} from '../investigation'
import styles from './NetworkDiagram.module.css'

export interface NetworkDiagramDetail {
  readonly label: string
  readonly value: string
}

interface NetworkDiagramProps {
  readonly topology: ScenarioTopology
  readonly details: readonly NetworkDiagramDetail[]
  readonly feedback?: NetworkDiagramFeedback
}

const STATUS_LABELS: Readonly<Record<CommunicationStatus, string>> = {
  UNINVESTIGATED: '未調査',
  SUCCESS: '通信成功',
  FAILURE: '通信失敗',
}

function TopologyNode({
  node,
  status,
}: {
  readonly node: ScenarioTopologyNode
  readonly status?: CommunicationStatus
}) {
  return (
    <article
      className={styles.node}
      data-node-id={node.id}
      data-communication-status={status}
    >
      <span className={styles.nodeMarker} aria-hidden="true" />
      <div>
        <h3>{node.name}</h3>
        <code>{node.detail}</code>
      </div>
      {status !== undefined && (
        <span className={styles.nodeStatus}>{STATUS_LABELS[status]}</span>
      )}
    </article>
  )
}

export function NetworkDiagram({
  topology,
  details,
  feedback,
}: NetworkDiagramProps) {
  return (
    <figure className={styles.diagram} aria-label="Scenario network topology">
      <ol className={styles.mainPath} aria-label="Main network path">
        {topology.mainPath.map((node) => (
          <li key={node.id}>
            <TopologyNode
              node={node}
              status={feedback?.nodeStatuses[node.id]}
            />
          </li>
        ))}
      </ol>

      <aside className={styles.dnsBranch} aria-label="DNS branch">
        <p>{topology.dnsConnectionLabel}</p>
        <TopologyNode
          node={topology.dnsNode}
          status={feedback?.nodeStatuses[topology.dnsNode.id]}
        />
      </aside>

      {feedback !== undefined && (
        <section className={styles.feedback} aria-label="通信経路の調査結果">
          <h3>Path feedback</h3>
          {feedback.items.length === 0 ? (
            <p>未調査 — Terminalを実行すると結果が反映されます。</p>
          ) : (
            <ul>
              {feedback.items.map((item) => (
                <li key={item.id} data-status={item.status}>
                  <span aria-hidden="true">
                    {item.status === 'SUCCESS' ? '✓' : '!'}
                  </span>
                  {item.label}: {STATUS_LABELS[item.status]}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <figcaption>Scenario data / simulated network</figcaption>

      <dl className={styles.details}>
        {details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}
