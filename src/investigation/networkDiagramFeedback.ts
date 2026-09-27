import type { ScenarioTopology, ScenarioTopologyNode } from '../scenario'
import type { InvestigationObservation } from './observation'

export type CommunicationStatus = 'UNINVESTIGATED' | 'SUCCESS' | 'FAILURE'

export interface CommunicationFeedbackItem {
  readonly id: string
  readonly label: string
  readonly nodeId: string
  readonly status: Exclude<CommunicationStatus, 'UNINVESTIGATED'>
}

export interface NetworkDiagramFeedback {
  readonly nodeStatuses: Readonly<Record<string, CommunicationStatus>>
  readonly items: readonly CommunicationFeedbackItem[]
}

export function createNetworkDiagramFeedback(
  topology: ScenarioTopology,
  observations: readonly InvestigationObservation[],
): NetworkDiagramFeedback {
  const nodes = [...topology.mainPath, topology.dnsNode]
  const latestByTarget = new Map<string, InvestigationObservation>()

  for (const observation of observations) {
    latestByTarget.set(getObservationId(observation), observation)
  }

  const items = [...latestByTarget.entries()].map(([id, observation]) =>
    createFeedbackItem(id, observation, topology),
  )
  const nodeStatuses = Object.fromEntries(
    nodes.map((node) => [node.id, getNodeStatus(node, items)]),
  )

  return Object.freeze({
    nodeStatuses: Object.freeze(nodeStatuses),
    items: Object.freeze(items.map((item) => Object.freeze(item))),
  })
}

function getObservationId(observation: InvestigationObservation): string {
  return observation.kind === 'DNS_RESOLUTION'
    ? `${observation.kind}:${observation.hostname}`
    : `${observation.kind}:${observation.target}`
}

function createFeedbackItem(
  id: string,
  observation: InvestigationObservation,
  topology: ScenarioTopology,
): CommunicationFeedbackItem {
  if (observation.kind === 'GATEWAY_REACHABILITY') {
    return {
      id,
      label: `Gateway (${observation.target})`,
      nodeId: findGatewayNode(topology).id,
      status: observation.reachable ? 'SUCCESS' : 'FAILURE',
    }
  }

  if (observation.kind === 'DNS_RESOLUTION') {
    return {
      id,
      label: `DNS (${observation.hostname})`,
      nodeId: topology.dnsNode.id,
      status: observation.resolved ? 'SUCCESS' : 'FAILURE',
    }
  }

  return {
    id,
    label: `Target (${observation.target})`,
    nodeId: findTargetNode(topology, observation.target).id,
    status: observation.reachable ? 'SUCCESS' : 'FAILURE',
  }
}

function findGatewayNode(topology: ScenarioTopology): ScenarioTopologyNode {
  return (
    topology.mainPath.find(
      (node) => node.id === 'router' || /router/i.test(node.name),
    ) ??
    topology.mainPath.at(-1) ??
    topology.dnsNode
  )
}

function findTargetNode(
  topology: ScenarioTopology,
  target: string,
): ScenarioTopologyNode {
  const allNodes = [...topology.mainPath, topology.dnsNode]
  const exactMatch = allNodes.find((node) => node.detail.includes(target))
  if (exactMatch !== undefined) return exactMatch

  const suffix = target.match(/\.\d+$/)?.[0]
  if (suffix !== undefined) {
    const suffixMatch = allNodes.find((node) => node.detail.includes(suffix))
    if (suffixMatch !== undefined) return suffixMatch
  }

  return topology.mainPath.at(-1) ?? topology.dnsNode
}

function getNodeStatus(
  node: ScenarioTopologyNode,
  items: readonly CommunicationFeedbackItem[],
): CommunicationStatus {
  const nodeItems = items.filter((item) => item.nodeId === node.id)
  if (nodeItems.some((item) => item.status === 'FAILURE')) return 'FAILURE'
  if (nodeItems.some((item) => item.status === 'SUCCESS')) return 'SUCCESS'
  return 'UNINVESTIGATED'
}
