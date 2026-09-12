import { describe, expect, it } from 'vitest'
import { createNetworkState, simulatePing } from '../network'
import { validateScenario } from './validateScenario'
import {
  SUBNET_GOLEM_CORRECT_MASK,
  SUBNET_GOLEM_PEER_ADDRESSES,
  SUBNET_GOLEM_SCENARIO,
} from './subnetGolemScenario'

describe('Subnet Golem scenario', () => {
  it('loads the bundled JSON through Scenario validation', () => {
    expect(validateScenario(SUBNET_GOLEM_SCENARIO).success).toBe(true)
    expect(SUBNET_GOLEM_SCENARIO.answer.cause).toBe('SUBNET_MASK')
    expect(SUBNET_GOLEM_CORRECT_MASK).toBe('255.255.255.0')
  })

  it('exposes different reachability across multiple LAN peers', () => {
    const creation = createNetworkState(SUBNET_GOLEM_SCENARIO)
    expect(creation.success).toBe(true)
    if (!creation.success) return

    expect(
      simulatePing(creation.state, SUBNET_GOLEM_PEER_ADDRESSES[0]),
    ).toMatchObject({
      reachable: true,
    })
    expect(
      simulatePing(creation.state, SUBNET_GOLEM_PEER_ADDRESSES[1]),
    ).toEqual({
      reachable: false,
      reason: 'UNREACHABLE',
    })
  })
})
