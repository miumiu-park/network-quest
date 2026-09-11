import type { NetworkState } from './networkState'
import type { PingSimulationResult } from './networkSimulator'
import { isIpv4Address } from './networkStateSchema'

const CLIENT_ROUND_TRIP_TIME_MS = 0
const GATEWAY_ROUND_TRIP_TIME_MS = 1
const INTERNET_ROUND_TRIP_TIME_MS = 12

export function simulatePing(
  state: NetworkState,
  target: string,
): PingSimulationResult {
  const address = resolveIpTarget(state, target)

  if (address === null) {
    return { reachable: false, reason: 'HOST_NOT_FOUND' }
  }

  if (address === state.client.ipAddress) {
    return state.client.linkUp
      ? reachable(address, CLIENT_ROUND_TRIP_TIME_MS)
      : unreachable()
  }

  if (address === state.gateway.ipAddress) {
    return hasReachableGateway(state)
      ? reachable(address, GATEWAY_ROUND_TRIP_TIME_MS)
      : unreachable()
  }

  const isKnownInternetAddress =
    state.internet.reachableAddresses.includes(address)
  const hasWorkingDefaultRoute =
    state.client.gateway === state.gateway.ipAddress

  return hasReachableGateway(state) &&
    hasWorkingDefaultRoute &&
    state.internet.online &&
    isKnownInternetAddress
    ? reachable(address, INTERNET_ROUND_TRIP_TIME_MS)
    : unreachable()
}

function hasReachableGateway(state: NetworkState): boolean {
  return (
    state.client.linkUp &&
    state.gateway.online &&
    isSameSubnet(
      state.client.ipAddress,
      state.gateway.ipAddress,
      state.client.subnetMask,
    )
  )
}

function isSameSubnet(
  firstAddress: string,
  secondAddress: string,
  subnetMask: string,
): boolean {
  const mask = ipv4ToUint32(subnetMask)
  return (
    (ipv4ToUint32(firstAddress) & mask) === (ipv4ToUint32(secondAddress) & mask)
  )
}

function ipv4ToUint32(address: string): number {
  return address
    .split('.')
    .reduce((value, octet) => (value << 8) | Number(octet), 0)
}

function resolveIpTarget(state: NetworkState, target: string): string | null {
  if (target === 'client') {
    return state.client.ipAddress
  }

  if (target === 'gateway') {
    return state.gateway.ipAddress
  }

  return isIpv4Address(target) ? target : null
}

function reachable(
  address: string,
  roundTripTimeMs: number,
): PingSimulationResult {
  return { reachable: true, address, roundTripTimeMs }
}

function unreachable(): PingSimulationResult {
  return { reachable: false, reason: 'UNREACHABLE' }
}
