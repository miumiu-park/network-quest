import { describe, expect, it } from 'vitest'
import { createNetworkState, simulatePing } from '../network'
import {
  GATEWAY_GOBLIN_CORRECT_GATEWAY,
  GATEWAY_GOBLIN_EXTERNAL_IP,
  GATEWAY_GOBLIN_SCENARIO,
} from './gatewayGoblinScenario'

describe('Gateway Goblin scenario', () => {
  it('loads the bundled JSON through Scenario validation', () => {
    expect(GATEWAY_GOBLIN_SCENARIO).toMatchObject({
      id: 'gateway-goblin',
      enemy: { name: 'Gateway Goblin', maxHp: 100 },
      failure: { type: 'GATEWAY_MISCONFIGURATION' },
      answer: { cause: 'GATEWAY' },
      reward: { exp: 120 },
    })
  })

  it('models local Router reachability with external route failure', () => {
    const creation = createNetworkState(GATEWAY_GOBLIN_SCENARIO)
    expect(creation.success).toBe(true)
    if (!creation.success) return

    expect(
      simulatePing(creation.state, GATEWAY_GOBLIN_CORRECT_GATEWAY),
    ).toMatchObject({ reachable: true })
    expect(simulatePing(creation.state, GATEWAY_GOBLIN_EXTERNAL_IP)).toEqual({
      reachable: false,
      reason: 'UNREACHABLE',
    })
  })
})
