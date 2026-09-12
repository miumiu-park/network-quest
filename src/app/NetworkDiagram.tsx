import type { ScenarioTopology, ScenarioTopologyNode } from '../scenario'
import styles from './NetworkDiagram.module.css'

export interface NetworkDiagramDetail {
  readonly label: string
  readonly value: string
}

interface NetworkDiagramProps {
  readonly topology: ScenarioTopology
  readonly details: readonly NetworkDiagramDetail[]
}

function TopologyNode({ node }: { readonly node: ScenarioTopologyNode }) {
  return (
    <article className={styles.node} data-node-id={node.id}>
      <span className={styles.nodeMarker} aria-hidden="true" />
      <div>
        <h3>{node.name}</h3>
        <code>{node.detail}</code>
      </div>
    </article>
  )
}

export function NetworkDiagram({ topology, details }: NetworkDiagramProps) {
  return (
    <figure className={styles.diagram} aria-label="Scenario network topology">
      <ol className={styles.mainPath} aria-label="Main network path">
        {topology.mainPath.map((node) => (
          <li key={node.id}>
            <TopologyNode node={node} />
          </li>
        ))}
      </ol>

      <aside className={styles.dnsBranch} aria-label="DNS branch">
        <p>{topology.dnsConnectionLabel}</p>
        <TopologyNode node={topology.dnsNode} />
      </aside>

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
