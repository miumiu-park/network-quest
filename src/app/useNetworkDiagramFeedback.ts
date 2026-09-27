import { useCallback, useMemo, useState } from 'react'
import {
  createNetworkDiagramFeedback,
  type InvestigationObservation,
  type NetworkDiagramFeedback,
} from '../investigation'
import type { ScenarioTopology } from '../scenario'

interface NetworkDiagramFeedbackController {
  readonly feedback: NetworkDiagramFeedback
  readonly recordObservations: (
    observations: readonly InvestigationObservation[],
  ) => void
}

export function useNetworkDiagramFeedback(
  topology: ScenarioTopology,
): NetworkDiagramFeedbackController {
  const [observations, setObservations] = useState<
    readonly InvestigationObservation[]
  >([])
  const recordObservations = useCallback(
    (nextObservations: readonly InvestigationObservation[]) => {
      if (nextObservations.length === 0) return
      setObservations((current) => [...current, ...nextObservations])
    },
    [],
  )
  const feedback = useMemo(
    () => createNetworkDiagramFeedback(topology, observations),
    [observations, topology],
  )

  return { feedback, recordObservations }
}
