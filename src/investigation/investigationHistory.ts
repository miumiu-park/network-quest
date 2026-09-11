import type { InvestigationObservation } from './observation'

export type InvestigationResultKind = 'output' | 'error'

export interface InvestigationResult {
  readonly kind: InvestigationResultKind
  readonly text: string
}

export interface InvestigationHistoryEntry {
  readonly command: string
  readonly args: readonly string[]
  readonly result: InvestigationResult
  readonly observations: readonly InvestigationObservation[]
  readonly timestamp: number
}

export interface InvestigationHistoryEntryInput {
  readonly command: string
  readonly args: readonly string[]
  readonly result: InvestigationResult
  readonly observations?: readonly InvestigationObservation[]
}

export interface InvestigationHistory {
  readonly addEntry: (
    entry: InvestigationHistoryEntryInput,
  ) => InvestigationHistoryEntry
  readonly getEntries: () => readonly InvestigationHistoryEntry[]
}

export type InvestigationClock = () => number

export function createInvestigationHistory(
  clock: InvestigationClock = Date.now,
): InvestigationHistory {
  let entries: readonly InvestigationHistoryEntry[] = Object.freeze([])

  return Object.freeze({
    addEntry(input: InvestigationHistoryEntryInput) {
      const entry = freezeEntry({
        command: input.command,
        args: input.args,
        result: input.result,
        observations: input.observations ?? [],
        timestamp: clock(),
      })

      entries = Object.freeze([...entries, entry])
      return entry
    },
    getEntries() {
      return entries
    },
  })
}

function freezeEntry(
  entry: InvestigationHistoryEntry,
): InvestigationHistoryEntry {
  return Object.freeze({
    ...entry,
    args: Object.freeze([...entry.args]),
    result: Object.freeze({ ...entry.result }),
    observations: Object.freeze(
      entry.observations.map((observation) =>
        Object.freeze({ ...observation }),
      ),
    ),
  })
}
