import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  applyInvestigationObservations,
  CAUSE_ANSWER_OPTIONS,
  createBattleEngine,
  recordSubnetMaskRepair,
  verifySubnetMaskRepair,
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
  repairSubnetMask,
  simulateNslookup,
  simulatePing,
  type NetworkState,
} from '../network'
import {
  SUBNET_GOLEM_CORRECT_MASK,
  SUBNET_GOLEM_PEER_ADDRESSES,
  SUBNET_GOLEM_SCENARIO,
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
import styles from './DnsSlimeBattle.module.css'
import { NetworkDiagram } from './NetworkDiagram'
import { APP_ROUTES } from './routes'

const scenarioCause = CAUSE_ANSWER_OPTIONS.find(
  (cause) => cause === SUBNET_GOLEM_SCENARIO.answer.cause,
)

if (scenarioCause === undefined) {
  throw new Error('Subnet Golem cause is not supported by Battle Engine')
}

const battleEngine = createBattleEngine({
  enemyMaxHp: SUBNET_GOLEM_SCENARIO.enemy.maxHp,
  effectiveInvestigationDamage: 35,
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
  const result = createNetworkState(SUBNET_GOLEM_SCENARIO)
  if (!result.success) {
    throw new Error('Subnet Golem network state failed validation')
  }
  return result.state
}

function isPeerObservation(observation: InvestigationObservation): boolean {
  return (
    'target' in observation &&
    SUBNET_GOLEM_PEER_ADDRESSES.some(
      (address) => address === observation.target,
    )
  )
}

export function SubnetGolemBattle() {
  const navigate = useNavigate()
  const [networkState, setNetworkState] = useState(createInitialNetworkState)
  const [battleState, setBattleState] = useState(
    battleEngine.createInitialState,
  )
  const [history] = useState(() => createInvestigationHistory())
  const verifiedTargets = useRef(new Set<string>())
  const [message, setMessage] = useState(
    'interface設定を確認し、2台のLAN端末への到達性を比較してください。',
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
            isPeerObservation,
          )
          const target = command.args[0]

          if (
            command.command === 'ping' &&
            target !== undefined &&
            SUBNET_GOLEM_PEER_ADDRESSES.some((address) => address === target) &&
            investigatedState.repairStatus === 'REPAIRED' &&
            result.kind === 'output'
          ) {
            verifiedTargets.current.add(target)
          }

          if (
            investigatedState.repairStatus === 'REPAIRED' &&
            verifiedTargets.current.size === SUBNET_GOLEM_PEER_ADDRESSES.length
          ) {
            return verifySubnetMaskRepair(
              battleEngine,
              investigatedState,
              networkState,
              SUBNET_GOLEM_PEER_ADDRESSES,
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
        ? '正解です。管理端末のSubnet Maskを修復してください。'
        : `${causeLabels[answer]}ではありません。端末ごとの到達範囲を比較してください。`,
    )
  }

  function repairMask() {
    const repair = repairSubnetMask(networkState, SUBNET_GOLEM_CORRECT_MASK)

    if (!repair.success) {
      setMessage('Subnet Maskを修復できませんでした。')
      return
    }

    verifiedTargets.current.clear()
    setNetworkState(repair.state)
    setBattleState((currentState) =>
      recordSubnetMaskRepair(battleEngine, currentState, repair),
    )
    setMessage(
      `Subnet Maskを${SUBNET_GOLEM_CORRECT_MASK}へ修復しました。2台へのpingを再実行してください。`,
    )
  }

  function showResult() {
    navigate(APP_ROUTES.result, {
      state: {
        resultSummary: {
          enemyName: SUBNET_GOLEM_SCENARIO.enemy.name,
          exp: SUBNET_GOLEM_SCENARIO.reward.exp,
        },
        learningReview: createLearningReview(
          SUBNET_GOLEM_SCENARIO,
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
            Boss Scenario: {SUBNET_GOLEM_SCENARIO.id}
          </p>
          <h1>Battle</h1>
        </div>
        <p className={styles.scenarioTitle}>{SUBNET_GOLEM_SCENARIO.title}</p>
      </header>

      <div className={styles.battleGrid}>
        <section className={styles.enemyPane} aria-label="Enemy">
          <div className={styles.paneHeader}>
            <p className={styles.paneNumber}>01</p>
            <h2>Boss Enemy</h2>
          </div>
          <div
            className={`${styles.enemyPortrait} ${
              battleState.totalDamage > 0 ? styles.enemyDamaged : ''
            }`}
            key={`enemy-${battleState.totalDamage}`}
            aria-hidden="true"
          >
            🗿
          </div>
          <h3>{SUBNET_GOLEM_SCENARIO.enemy.name}</h3>
          <div className={styles.hpHeader}>
            <span>HP</span>
            <strong>
              {battleState.enemyHp} / {SUBNET_GOLEM_SCENARIO.enemy.maxHp}
            </strong>
          </div>
          <progress
            className={styles.hpBar}
            aria-label="Enemy HP"
            value={battleState.enemyHp}
            max={SUBNET_GOLEM_SCENARIO.enemy.maxHp}
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
              onClick={repairMask}
              disabled={
                battleState.diagnosisStatus !== 'CORRECT' ||
                battleState.repairStatus === 'REPAIRED'
              }
            >
              Subnet Maskを修復
            </button>
          </div>
        </section>

        <section className={styles.networkPane} aria-label="Network Diagram">
          <div className={styles.paneHeader}>
            <p className={styles.paneNumber}>02</p>
            <h2>Network Diagram</h2>
          </div>
          <NetworkDiagram
            topology={SUBNET_GOLEM_SCENARIO.topology}
            details={[
              { label: 'Admin PC', value: networkState.client.ipAddress },
              { label: 'Subnet Mask', value: networkState.client.subnetMask },
              { label: 'Terminal A', value: SUBNET_GOLEM_PEER_ADDRESSES[0] },
              { label: 'Terminal B', value: SUBNET_GOLEM_PEER_ADDRESSES[1] },
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
            <code>ping {SUBNET_GOLEM_PEER_ADDRESSES[0]}</code>
            <code>ping {SUBNET_GOLEM_PEER_ADDRESSES[1]}</code>
          </div>
          <Terminal execute={execute} />
        </section>
      </div>

      {battleState.status === 'CLEARED' && (
        <section className={styles.clear} aria-label="Stage Clear">
          <h2>Subnet Golem 撃破！</h2>
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
