import {
  simulateNslookup,
  type DnsRepairResult,
  type NetworkState,
  type NslookupSimulationResult,
} from '../network'
import type { BattleEngine, BattleEngineState } from './battleEngine'

export interface DnsRepairVerificationResult {
  readonly state: BattleEngineState
  readonly lookup: NslookupSimulationResult
}

export function recordDnsRepair(
  engine: Pick<BattleEngine, 'recordRepair'>,
  state: BattleEngineState,
  repair: DnsRepairResult,
): BattleEngineState {
  return repair.success && repair.changed ? engine.recordRepair(state) : state
}

export function verifyDnsRepair(
  engine: Pick<BattleEngine, 'verifyRepair'>,
  state: BattleEngineState,
  networkState: NetworkState,
  hostname: string,
): DnsRepairVerificationResult {
  const lookup = simulateNslookup(networkState, hostname)

  return Object.freeze({
    state: engine.verifyRepair(state, lookup.resolved),
    lookup: Object.freeze({ ...lookup }),
  })
}
