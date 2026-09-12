export { CAUSE_ANSWER_OPTIONS, createBattleEngine } from './battleEngine'
export { applyInvestigationObservations } from './investigationDamage'
export {
  recordDnsRepair,
  recordGatewayRepair,
  verifyDnsRepair,
  verifyGatewayRepair,
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
} from './repairVerification'
