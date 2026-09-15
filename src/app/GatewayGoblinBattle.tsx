import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  applyInvestigationObservations,
  CAUSE_ANSWER_OPTIONS,
  createBattleEngine,
  recordGatewayRepair,
  verifyGatewayRepair,
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
  repairGatewayConfiguration,
  simulateNslookup,
  simulatePing,
  type NetworkState,
} from '../network'
import {
  GATEWAY_GOBLIN_CORRECT_GATEWAY,
  GATEWAY_GOBLIN_EXTERNAL_IP,
  GATEWAY_GOBLIN_SCENARIO,
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
import { BattleEffects } from './BattleEffects'
import { BattleProgress } from './BattleProgress'
import styles from './DnsSlimeBattle.module.css'
import { NetworkDiagram } from './NetworkDiagram'
import { APP_ROUTES } from './routes'

const scenarioCause = CAUSE_ANSWER_OPTIONS.find(
  (cause) => cause === GATEWAY_GOBLIN_SCENARIO.answer.cause,
)

if (scenarioCause === undefined) {
  throw new Error('Gateway Goblin cause is not supported by Battle Engine')
}

const battleEngine = createBattleEngine({
  enemyMaxHp: GATEWAY_GOBLIN_SCENARIO.enemy.maxHp,
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
  const result = createNetworkState(GATEWAY_GOBLIN_SCENARIO)
  if (!result.success) {
    throw new Error('Gateway Goblin network state failed validation')
  }
  return result.state
}

function isEffectiveGatewayObservation(
  observation: InvestigationObservation,
): boolean {
  return observation.kind === 'INTERNET_REACHABILITY'
}

export function GatewayGoblinBattle() {
  const navigate = useNavigate()
  const [networkState, setNetworkState] = useState(createInitialNetworkState)
  const [battleState, setBattleState] = useState(
    battleEngine.createInitialState,
  )
  const [history] = useState(() => createInvestigationHistory())
  const [message, setMessage] = useState(
    '現在の設定、Router、外部IPの順に到達性を比較してください。',
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
            isEffectiveGatewayObservation,
          )

          if (
            command.command === 'ping' &&
            command.args[0] === GATEWAY_GOBLIN_EXTERNAL_IP &&
            investigatedState.repairStatus === 'REPAIRED'
          ) {
            return verifyGatewayRepair(
              battleEngine,
              investigatedState,
              networkState,
              GATEWAY_GOBLIN_EXTERNAL_IP,
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
        ? '正解です。Default Gatewayを修復してください。'
        : `${causeLabels[answer]}ではありません。調査結果を見直してください。`,
    )
  }

  function repairGateway() {
    const repair = repairGatewayConfiguration(
      networkState,
      GATEWAY_GOBLIN_CORRECT_GATEWAY,
    )

    if (!repair.success) {
      setMessage('Default Gatewayを修復できませんでした。')
      return
    }

    setNetworkState(repair.state)
    setBattleState((currentState) =>
      recordGatewayRepair(battleEngine, currentState, repair),
    )
    setMessage(
      `Default Gatewayを${GATEWAY_GOBLIN_CORRECT_GATEWAY}へ修復しました。外部IPへのpingで再確認してください。`,
    )
  }

  function showResult() {
    navigate(APP_ROUTES.result, {
      state: {
        resultSummary: {
          enemyName: GATEWAY_GOBLIN_SCENARIO.enemy.name,
          exp: GATEWAY_GOBLIN_SCENARIO.reward.exp,
        },
        learningReview: createLearningReview(
          GATEWAY_GOBLIN_SCENARIO,
          history.getEntries(),
        ),
      },
    })
  }

  return (
    <main id="center" className={styles.screen}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>
            Scenario: {GATEWAY_GOBLIN_SCENARIO.id}
          </p>
          <h1>Battle</h1>
        </div>
        <p className={styles.scenarioTitle}>{GATEWAY_GOBLIN_SCENARIO.title}</p>
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
            👺
          </div>
          <h3>{GATEWAY_GOBLIN_SCENARIO.enemy.name}</h3>
          <div className={styles.hpHeader}>
            <span>HP</span>
            <strong>
              {battleState.enemyHp} / {GATEWAY_GOBLIN_SCENARIO.enemy.maxHp}
            </strong>
          </div>
          <progress
            className={styles.hpBar}
            aria-label="Enemy HP"
            value={battleState.enemyHp}
            max={GATEWAY_GOBLIN_SCENARIO.enemy.maxHp}
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
              onClick={repairGateway}
              disabled={
                battleState.diagnosisStatus !== 'CORRECT' ||
                battleState.repairStatus === 'REPAIRED'
              }
            >
              Default Gatewayを修復
            </button>
          </div>
        </section>

        <section className={styles.networkPane} aria-label="Network Diagram">
          <div className={styles.paneHeader}>
            <p className={styles.paneNumber}>02</p>
            <h2>Network Diagram</h2>
          </div>
          <NetworkDiagram
            topology={GATEWAY_GOBLIN_SCENARIO.topology}
            details={[
              { label: 'Default Gateway', value: networkState.client.gateway },
              { label: 'Subnet', value: networkState.client.subnetMask },
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
            <code>ping {GATEWAY_GOBLIN_CORRECT_GATEWAY}</code>
            <code>ping {GATEWAY_GOBLIN_EXTERNAL_IP}</code>
          </div>
          <Terminal execute={execute} />
        </section>
      </div>

      {battleState.status === 'CLEARED' && (
        <section className={styles.clear} aria-label="Stage Clear">
          <h2>Gateway Goblin 撃破！</h2>
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
