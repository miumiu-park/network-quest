import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  applyInvestigationObservations,
  CAUSE_ANSWER_OPTIONS,
  createBattleEngine,
  recordDnsRepair,
  verifyDnsRepair,
  type CauseAnswer,
} from '../battle'
import {
  createInvestigationHistory,
  type InvestigationObservation,
} from '../investigation'
import { createLearningReview } from '../learning'
import {
  createNetworkSimulator,
  createNetworkState,
  repairDnsConfiguration,
  simulateNslookup,
  simulatePing,
  type NetworkState,
} from '../network'
import {
  DNS_SLIME_CORRECT_DNS,
  DNS_SLIME_EXTERNAL_IP,
  DNS_SLIME_HOSTNAME,
  DNS_SLIME_SCENARIO,
} from '../scenario'
import {
  createCommandExecutor,
  createInvestigatedExecutor,
  createIpCommandHandler,
  createNslookupCommandHandler,
  createPingCommandHandler,
  Terminal,
  type TerminalExecutor,
} from '../terminal'
import { APP_ROUTES } from './routes'
import styles from './DnsSlimeBattle.module.css'

const scenarioCause = CAUSE_ANSWER_OPTIONS.find(
  (cause) => cause === DNS_SLIME_SCENARIO.answer.cause,
)

if (scenarioCause === undefined) {
  throw new Error('DNS Slime cause is not supported by Battle Engine')
}

const battleEngine = createBattleEngine({
  enemyMaxHp: DNS_SLIME_SCENARIO.enemy.maxHp,
  effectiveInvestigationDamage: 30,
  correctCause: scenarioCause,
})

const causeLabels: Readonly<Record<CauseAnswer, string>> = {
  IP_ADDRESS: 'IP Address',
  GATEWAY: 'Gateway',
  DNS: 'DNS',
  FIREWALL: 'Firewall',
}

function createInitialNetworkState(): NetworkState {
  const result = createNetworkState(DNS_SLIME_SCENARIO)

  if (!result.success) {
    throw new Error('DNS Slime network state failed validation')
  }

  return result.state
}

function isEffectiveDnsSlimeObservation(
  observation: InvestigationObservation,
): boolean {
  return (
    (observation.kind === 'GATEWAY_REACHABILITY' && observation.reachable) ||
    (observation.kind === 'INTERNET_REACHABILITY' && observation.reachable) ||
    (observation.kind === 'DNS_RESOLUTION' && !observation.resolved)
  )
}

export function DnsSlimeBattle() {
  const navigate = useNavigate()
  const [networkState, setNetworkState] = useState(createInitialNetworkState)
  const [battleState, setBattleState] = useState(
    battleEngine.createInitialState,
  )
  const [history] = useState(() => createInvestigationHistory())
  const [message, setMessage] = useState(
    'Terminalでgateway、外部IP、DNSの順に調査してください。',
  )

  const execute = useMemo<TerminalExecutor>(() => {
    const simulator = createNetworkSimulator(networkState, {
      simulatePing,
      simulateNslookup,
    })
    const commandExecutor = createCommandExecutor({
      ip: createIpCommandHandler(simulator),
      ping: createPingCommandHandler(simulator),
      nslookup: createNslookupCommandHandler(simulator),
    })
    const investigatedExecutor = createInvestigatedExecutor(
      commandExecutor,
      history,
    )

    return (command) => {
      const result = investigatedExecutor(command)
      const entry = history.getEntries().at(-1)

      if (entry !== undefined) {
        setBattleState((currentState) => {
          const investigatedState = applyInvestigationObservations(
            battleEngine,
            currentState,
            entry.observations,
            isEffectiveDnsSlimeObservation,
          )

          if (
            command.command === 'nslookup' &&
            command.args[0] === DNS_SLIME_HOSTNAME &&
            investigatedState.repairStatus === 'REPAIRED'
          ) {
            return verifyDnsRepair(
              battleEngine,
              investigatedState,
              networkState,
              DNS_SLIME_HOSTNAME,
            ).state
          }

          return investigatedState
        })
      }

      return result
    }
  }, [history, networkState])

  function submitCause(answer: CauseAnswer) {
    setBattleState((currentState) =>
      battleEngine.submitCauseAnswer(currentState, answer),
    )
    setMessage(
      answer === scenarioCause
        ? '正解です。DNS設定を修復してください。'
        : `${causeLabels[answer]}ではありません。調査結果を見直してください。`,
    )
  }

  function repairDns() {
    const repair = repairDnsConfiguration(networkState, DNS_SLIME_CORRECT_DNS)

    if (!repair.success) {
      setMessage('DNS設定を修復できませんでした。')
      return
    }

    setNetworkState(repair.state)
    setBattleState((currentState) =>
      recordDnsRepair(battleEngine, currentState, repair),
    )
    setMessage(
      `DNSを${DNS_SLIME_CORRECT_DNS}へ修復しました。nslookup ${DNS_SLIME_HOSTNAME}で再確認してください。`,
    )
  }

  function showResult() {
    navigate(APP_ROUTES.result, {
      state: {
        learningReview: createLearningReview(
          DNS_SLIME_SCENARIO,
          history.getEntries(),
        ),
      },
    })
  }

  return (
    <main id="center" className={styles.screen}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Scenario: {DNS_SLIME_SCENARIO.id}</p>
        <h1>Battle</h1>
        <h2>{DNS_SLIME_SCENARIO.enemy.name}</h2>
        <p>{DNS_SLIME_SCENARIO.title}</p>
      </header>

      <section className={styles.status} aria-label="Battle status">
        <p>Enemy HP: {battleState.enemyHp}</p>
        <p>Diagnosis: {battleState.diagnosisStatus}</p>
        <p>Repair: {battleState.repairStatus}</p>
      </section>

      <p className={styles.message} aria-live="polite">
        {message}
      </p>

      <section className={styles.guide} aria-label="調査ガイド">
        <h2>調査コマンド</h2>
        <code>ping gateway</code>
        <code>ping {DNS_SLIME_EXTERNAL_IP}</code>
        <code>nslookup {DNS_SLIME_HOSTNAME}</code>
      </section>

      <Terminal execute={execute} />

      <section className={styles.actions} aria-label="原因回答と修復">
        <h2>原因を回答</h2>
        <div className={styles.buttons}>
          {(Object.keys(causeLabels) as CauseAnswer[]).map((answer) => (
            <button
              type="button"
              key={answer}
              onClick={() => submitCause(answer)}
              disabled={battleState.diagnosisStatus === 'CORRECT'}
            >
              {causeLabels[answer]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={repairDns}
          disabled={
            battleState.diagnosisStatus !== 'CORRECT' ||
            battleState.repairStatus === 'REPAIRED'
          }
        >
          DNS設定を修復
        </button>
      </section>

      {battleState.status === 'CLEARED' && (
        <section className={styles.clear} aria-label="Stage Clear">
          <h2>DNS Slime 撃破！</h2>
          <p>Stage Clear</p>
          <button type="button" onClick={showResult}>
            Resultへ
          </button>
        </section>
      )}
    </main>
  )
}
