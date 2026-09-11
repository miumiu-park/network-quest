export type InvestigationObservation =
  | {
      readonly kind: 'GATEWAY_REACHABILITY'
      readonly target: string
      readonly reachable: boolean
    }
  | {
      readonly kind: 'INTERNET_REACHABILITY'
      readonly target: string
      readonly reachable: boolean
    }
  | {
      readonly kind: 'DNS_RESOLUTION'
      readonly hostname: string
      readonly resolved: boolean
    }

export interface ObservationCommand {
  readonly command: string
  readonly args: readonly string[]
}

export interface ObservationCommandResult {
  readonly kind: 'output' | 'error'
}

export function createObservations(
  command: ObservationCommand,
  result: ObservationCommandResult,
): readonly InvestigationObservation[] {
  if (command.args.length !== 1) {
    return Object.freeze([])
  }

  const [target] = command.args

  if (command.command === 'ping') {
    const observation: InvestigationObservation =
      target === 'gateway'
        ? {
            kind: 'GATEWAY_REACHABILITY',
            target,
            reachable: result.kind === 'output',
          }
        : {
            kind: 'INTERNET_REACHABILITY',
            target,
            reachable: result.kind === 'output',
          }

    return Object.freeze([Object.freeze(observation)])
  }

  if (command.command === 'nslookup') {
    return Object.freeze([
      Object.freeze({
        kind: 'DNS_RESOLUTION' as const,
        hostname: target,
        resolved: result.kind === 'output',
      }),
    ])
  }

  return Object.freeze([])
}
