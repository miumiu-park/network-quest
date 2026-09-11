export interface ClientNetworkState {
  readonly ipAddress: string
  readonly subnetMask: string
  readonly gateway: string
  readonly dnsServers: readonly string[]
  readonly linkUp: boolean
}

export interface GatewayNetworkState {
  readonly ipAddress: string
  readonly online: boolean
}

export interface DnsServerNetworkState {
  readonly ipAddress: string
  readonly online: boolean
  readonly records: Readonly<Record<string, string>>
}

export interface DnsNetworkState {
  readonly servers: readonly DnsServerNetworkState[]
}

export interface InternetNetworkState {
  readonly online: boolean
  readonly reachableAddresses: readonly string[]
}

export interface NetworkState {
  readonly client: ClientNetworkState
  readonly gateway: GatewayNetworkState
  readonly dns: DnsNetworkState
  readonly internet: InternetNetworkState
}
