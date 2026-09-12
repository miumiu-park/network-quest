import { describe, expect, it } from 'vitest'
import { createNetworkState, simulatePing } from '../network'
import {
  IP_SLIME_CORRECT_ADDRESS,
  IP_SLIME_GATEWAY,
  IP_SLIME_SCENARIO,
} from './ipSlimeScenario'

describe('IP Slime scenario', () => {
  it('loads the bundled JSON through Scenario validation', () => {
    expect(IP_SLIME_SCENARIO).toMatchObject({
      id: 'ip-slime',
      enemy: { name: 'IP Slime', maxHp: 100 },
      failure: { type: 'IP_ADDRESS_MISCONFIGURATION' },
      answer: { cause: 'IP_ADDRESS' },
      reward: { exp: 100 },
    })
  })

  it('models gateway failure caused by a client address in another subnet', () => {
    const creation = createNetworkState(IP_SLIME_SCENARIO)
    expect(creation.success).toBe(true)
    if (!creation.success) return

    expect(simulatePing(creation.state, IP_SLIME_GATEWAY)).toEqual({
      reachable: false,
      reason: 'UNREACHABLE',
    })
    expect(creation.state.client.ipAddress).not.toBe(IP_SLIME_CORRECT_ADDRESS)
  })
})
