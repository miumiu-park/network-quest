import {
  simulatePing,
  simulateNslookup,
  type DnsRepairResult,
  type GatewayRepairResult,
  type IpAddressRepairResult,
  type SubnetMaskRepairResult,
  type NetworkState,
  type NslookupSimulationResult,
} from '../network'
import type { BattleEngine, BattleEngineState } from './battleEngine'

export interface DnsRepairVerificationResult {
  readonly state: BattleEngineState
  readonly lookup: NslookupSimulationResult
}

export interface GatewayRepairVerificationResult {
  readonly state: BattleEngineState
  readonly ping: ReturnType<typeof simulatePing>
}

export interface IpAddressRepairVerificationResult {
  readonly state: BattleEngineState
  readonly ping: ReturnType<typeof simulatePing>
}

export interface SubnetMaskRepairVerificationResult {
  readonly state: BattleEngineState
  readonly pings: readonly ReturnType<typeof simulatePing>[]
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

export function recordGatewayRepair(
  engine: Pick<BattleEngine, 'recordRepair'>,
  state: BattleEngineState,
  repair: GatewayRepairResult,
): BattleEngineState {
  return repair.success && repair.changed ? engine.recordRepair(state) : state
}

export function verifyGatewayRepair(
  engine: Pick<BattleEngine, 'verifyRepair'>,
  state: BattleEngineState,
  networkState: NetworkState,
  target: string,
): GatewayRepairVerificationResult {
  const ping = simulatePing(networkState, target)

  return Object.freeze({
    state: engine.verifyRepair(state, ping.reachable),
    ping: Object.freeze({ ...ping }),
  })
}

export function recordIpAddressRepair(
  engine: Pick<BattleEngine, 'recordRepair'>,
  state: BattleEngineState,
  repair: IpAddressRepairResult,
): BattleEngineState {
  return repair.success && repair.changed ? engine.recordRepair(state) : state
}

export function verifyIpAddressRepair(
  engine: Pick<BattleEngine, 'verifyRepair'>,
  state: BattleEngineState,
  networkState: NetworkState,
): IpAddressRepairVerificationResult {
  const ping = simulatePing(networkState, 'gateway')

  return Object.freeze({
    state: engine.verifyRepair(state, ping.reachable),
    ping: Object.freeze({ ...ping }),
  })
}

export function recordSubnetMaskRepair(
  engine: Pick<BattleEngine, 'recordRepair'>,
  state: BattleEngineState,
  repair: SubnetMaskRepairResult,
): BattleEngineState {
  return repair.success && repair.changed ? engine.recordRepair(state) : state
}

export function verifySubnetMaskRepair(
  engine: Pick<BattleEngine, 'verifyRepair'>,
  state: BattleEngineState,
  networkState: NetworkState,
  targets: readonly string[],
): SubnetMaskRepairVerificationResult {
  const pings = Object.freeze(
    targets.map((target) =>
      Object.freeze({ ...simulatePing(networkState, target) }),
    ),
  )

  return Object.freeze({
    state: engine.verifyRepair(
      state,
      pings.length > 0 && pings.every((ping) => ping.reachable),
    ),
    pings,
  })
}
