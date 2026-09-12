export { CAUSE_ANSWER_OPTIONS, createBattleEngine } from './battleEngine'
export { applyInvestigationObservations } from './investigationDamage'
export {
  recordDnsRepair,
  recordGatewayRepair,
  recordIpAddressRepair,
  recordSubnetMaskRepair,
  verifyDnsRepair,
  verifyGatewayRepair,
  verifyIpAddressRepair,
  verifySubnetMaskRepair,
} from './repairVerification'
export type {
  BattleEngine,
  BattleEngineConfig,
  BattleEngineState,
  BattleEngineStatus,
  BattleInvestigationResult,
  CauseAnswer,
  CauseAnswerResult,
  DiagnosisStatus,
  InvestigationEffectiveness,
  RepairStatus,
  RepairVerificationStatus,
} from './battleEngine'
export type { ObservationEffectivenessEvaluator } from './investigationDamage'
export type {
  DnsRepairVerificationResult,
  GatewayRepairVerificationResult,
  IpAddressRepairVerificationResult,
  SubnetMaskRepairVerificationResult,
} from './repairVerification'
