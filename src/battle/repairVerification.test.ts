import { describe, expect, it } from 'vitest'
import {
  repairDnsConfiguration,
  type DnsRepairResult,
  type NetworkState,
} from '../network'
import { createBattleEngine } from './battleEngine'
import { recordDnsRepair, verifyDnsRepair } from './repairVerification'

const engine = createBattleEngine({
  enemyMaxHp: 100,
  effectiveInvestigationDamage: 30,
  correctCause: 'DNS',
})

const dnsSlimeState: NetworkState = {
  client: {
    ipAddress: '192.168.1.10',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServers: ['192.168.1.99'],
    linkUp: true,
  },
  gateway: { ipAddress: '192.168.1.1', online: true },
  dns: {
    servers: [
      {
        ipAddress: '192.168.1.53',
        online: true,
        records: { 'quest.example': '203.0.113.20' },
      },
    ],
  },
  internet: {
    online: true,
    reachableAddresses: ['203.0.113.20'],
  },
}

describe('DNS repair verification flow', () => {
  it('records a successful repair without clearing the battle', () => {
    const repair = repairDnsConfiguration(dnsSlimeState, '192.168.1.53')
    const state = recordDnsRepair(engine, engine.createInitialState(), repair)

    expect(state).toMatchObject({
      repairStatus: 'REPAIRED',
      repairVerificationStatus: 'NOT_VERIFIED',
      status: 'IN_PROGRESS',
    })
  })

  it('does not record a failed repair', () => {
    const repair: DnsRepairResult = {
      success: false,
      state: dnsSlimeState,
      error: { code: 'DNS_SERVER_NOT_FOUND', server: '8.8.8.8' },
    }
    const state = engine.createInitialState()

    expect(recordDnsRepair(engine, state, repair)).toBe(state)
  })

  it('does not treat an already-correct setting as a performed repair', () => {
    const repair = repairDnsConfiguration(dnsSlimeState, '192.168.1.53')
    const unchangedRepair = repairDnsConfiguration(repair.state, '192.168.1.53')
    const state = engine.createInitialState()

    expect(recordDnsRepair(engine, state, unchangedRepair)).toBe(state)
  })

  it('does not clear from a successful lookup before repair is recorded', () => {
    const repair = repairDnsConfiguration(dnsSlimeState, '192.168.1.53')
    expect(repair.success).toBe(true)
    const state = engine.createInitialState()

    const verification = verifyDnsRepair(
      engine,
      state,
      repair.state,
      'quest.example',
    )

    expect(verification.lookup).toMatchObject({ resolved: true })
    expect(verification.state).toBe(state)
    expect(verification.state.status).toBe('IN_PROGRESS')
  })

  it('keeps the battle in progress when the post-repair check fails', () => {
    const repairedBattle = engine.recordRepair(engine.createInitialState())

    const verification = verifyDnsRepair(
      engine,
      repairedBattle,
      dnsSlimeState,
      'quest.example',
    )

    expect(verification.lookup).toMatchObject({
      resolved: false,
      reason: 'DNS_MISCONFIGURED',
    })
    expect(verification.state).toMatchObject({
      repairStatus: 'REPAIRED',
      repairVerificationStatus: 'FAILED',
      status: 'IN_PROGRESS',
    })
  })

  it('clears only after a repaired virtual State passes revalidation', () => {
    const repair = repairDnsConfiguration(dnsSlimeState, '192.168.1.53')
    expect(repair.success).toBe(true)
    const repairedBattle = recordDnsRepair(
      engine,
      engine.createInitialState(),
      repair,
    )

    expect(repairedBattle.status).toBe('IN_PROGRESS')

    const verification = verifyDnsRepair(
      engine,
      repairedBattle,
      repair.state,
      'quest.example',
    )

    expect(verification.lookup).toEqual({
      resolved: true,
      server: '192.168.1.53',
      address: '203.0.113.20',
    })
    expect(verification.state).toMatchObject({
      enemyHp: 0,
      repairStatus: 'REPAIRED',
      repairVerificationStatus: 'SUCCEEDED',
      status: 'CLEARED',
    })
    expect(Object.isFrozen(verification)).toBe(true)
    expect(Object.isFrozen(verification.lookup)).toBe(true)
  })
})
