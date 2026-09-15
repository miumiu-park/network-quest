import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  applyInvestigationObservations,
  CAUSE_ANSWER_OPTIONS,
  createBattleEngine,
  recordIpAddressRepair,
  verifyIpAddressRepair,
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
  repairIpAddress,
  simulateNslookup,
  simulatePing,
  type NetworkState,
} from '../network'
import { IP_SLIME_CORRECT_ADDRESS, IP_SLIME_SCENARIO } from '../scenario'
import {
  createCommandExecutor,
  createInvestigatedExecutor,
  createIpCommandHandler,
  createNslookupCommandHandler,
  createPingCommandHandler,
  Terminal,
  type TerminalExecutor,
} from '../terminal'
import { BattleEffects } from './BattleEffects'
import { BattleProgress } from './BattleProgress'
import styles from './DnsSlimeBattle.module.css'
import { NetworkDiagram } from './NetworkDiagram'
import { APP_ROUTES } from './routes'

const scenarioCause = CAUSE_ANSWER_OPTIONS.find(
  (cause) => cause === IP_SLIME_SCENARIO.answer.cause,
)

if (scenarioCause === undefined) {
  throw new Error('IP Slime cause is not supported by Battle Engine')
}

const battleEngine = createBattleEngine({
  enemyMaxHp: IP_SLIME_SCENARIO.enemy.maxHp,
  effectiveInvestigationDamage: 30,
  correctCause: scenarioCause,
})

const causeLabels: Readonly<Record<CauseAnswer, string>> = {
  IP_ADDRESS: 'IP Address',
  GATEWAY: 'Gateway',
  DNS: 'DNS',
  FIREWALL: 'Firewall',
  SUBNET_MASK: 'Subnet Mask',
}

function createInitialNetworkState(): NetworkState {
  const result = createNetworkState(IP_SLIME_SCENARIO)
  if (!result.success) {
    throw new Error('IP Slime network state failed validation')
  }
  return result.state
}

function isEffectiveIpObservation(
  observation: InvestigationObservation,
): boolean {
  return observation.kind === 'GATEWAY_REACHABILITY'
}

export function IpSlimeBattle() {
  const navigate = useNavigate()
  const [networkState, setNetworkState] = useState(createInitialNetworkState)
  const [battleState, setBattleState] = useState(
    battleEngine.createInitialState,
  )
  const [history] = useState(() => createInvestigationHistory())
  const [message, setMessage] = useState(
    '現在のinterface設定を確認し、Gatewayへの到達性を調査してください。',
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
            isEffectiveIpObservation,
          )

          if (
            command.command === 'ping' &&
            command.args[0] === 'gateway' &&
            investigatedState.repairStatus === 'REPAIRED'
          ) {
            return verifyIpAddressRepair(
              battleEngine,
              investigatedState,
              networkState,
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
        ? '正解です。ClientのIP Addressを修復してください。'
        : `${causeLabels[answer]}ではありません。調査結果を見直してください。`,
    )
  }

  function repairAddress() {
    const repair = repairIpAddress(networkState, IP_SLIME_CORRECT_ADDRESS)

    if (!repair.success) {
      setMessage('IP Addressを修復できませんでした。')
      return
    }

    setNetworkState(repair.state)
    setBattleState((currentState) =>
      recordIpAddressRepair(battleEngine, currentState, repair),
    )
    setMessage(
      `IP Addressを${IP_SLIME_CORRECT_ADDRESS}へ修復しました。Gatewayへのpingで再確認してください。`,
    )
  }

  function showResult() {
    navigate(APP_ROUTES.result, {
      state: {
        resultSummary: {
          enemyName: IP_SLIME_SCENARIO.enemy.name,
          exp: IP_SLIME_SCENARIO.reward.exp,
        },
        learningReview: createLearningReview(
          IP_SLIME_SCENARIO,
          history.getEntries(),
        ),
      },
    })
  }

  return (
    <main id="center" className={styles.screen}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Scenario: {IP_SLIME_SCENARIO.id}</p>
          <h1>Battle</h1>
        </div>
        <p className={styles.scenarioTitle}>{IP_SLIME_SCENARIO.title}</p>
      </header>

      <BattleProgress state={battleState} />

      <div className={styles.battleGrid}>
        <section className={styles.enemyPane} aria-label="Enemy">
          <div className={styles.paneHeader}>
            <p className={styles.paneNumber}>01</p>
            <h2>Enemy</h2>
          </div>
          <div
            className={`${styles.enemyPortrait} ${
              battleState.totalDamage > 0 ? styles.enemyDamaged : ''
            }`}
            key={`enemy-${battleState.totalDamage}`}
            aria-hidden="true"
          >
            🦠
          </div>
          <h3>{IP_SLIME_SCENARIO.enemy.name}</h3>
          <div className={styles.hpHeader}>
            <span>HP</span>
            <strong>
              {battleState.enemyHp} / {IP_SLIME_SCENARIO.enemy.maxHp}
            </strong>
          </div>
          <progress
            className={styles.hpBar}
            aria-label="Enemy HP"
            value={battleState.enemyHp}
            max={IP_SLIME_SCENARIO.enemy.maxHp}
          />
          <dl className={styles.statusList} aria-label="Battle status">
            <div>
              <dt>Diagnosis</dt>
              <dd>{battleState.diagnosisStatus}</dd>
            </div>
            <div>
              <dt>Repair</dt>
              <dd>{battleState.repairStatus}</dd>
            </div>
          </dl>
          <p className={styles.message} aria-live="polite">
            {message}
          </p>
          <div className={styles.actions} aria-label="原因回答と修復">
            <h3>原因を回答</h3>
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
              onClick={repairAddress}
              disabled={
                battleState.diagnosisStatus !== 'CORRECT' ||
                battleState.repairStatus === 'REPAIRED'
              }
            >
              IP Addressを修復
            </button>
          </div>
        </section>

        <section className={styles.networkPane} aria-label="Network Diagram">
          <div className={styles.paneHeader}>
            <p className={styles.paneNumber}>02</p>
            <h2>Network Diagram</h2>
          </div>
          <NetworkDiagram
            topology={IP_SLIME_SCENARIO.topology}
            details={[
              { label: 'IP Address', value: networkState.client.ipAddress },
              { label: 'Subnet', value: networkState.client.subnetMask },
              { label: 'Gateway', value: networkState.client.gateway },
            ]}
          />
        </section>

        <section className={styles.terminalPane} aria-label="Terminal">
          <div className={styles.paneHeader}>
            <p className={styles.paneNumber}>03</p>
            <h2>Terminal</h2>
          </div>
          <div className={styles.guide} aria-label="調査ガイド">
            <p>Suggested commands</p>
            <code>ip</code>
            <code>ping gateway</code>
          </div>
          <Terminal execute={execute} />
        </section>
      </div>

      {battleState.status === 'CLEARED' && (
        <section className={styles.clear} aria-label="Stage Clear">
          <h2>IP Slime 撃破！</h2>
          <p>Stage Clear</p>
          <button type="button" onClick={showResult}>
            Resultへ
          </button>
        </section>
      )}
      <BattleEffects state={battleState} />
    </main>
  )
}
