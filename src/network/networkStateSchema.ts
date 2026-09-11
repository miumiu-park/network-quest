import { z } from 'zod'
import type { NetworkState } from './networkState'

const ipv4Address = z.string().refine(isIpv4Address, {
  message: 'Must be a valid IPv4 address',
})

const hostname = z.string().trim().min(1)

export const networkStateSchema: z.ZodType<NetworkState> = z.strictObject({
  client: z.strictObject({
    ipAddress: ipv4Address,
    subnetMask: ipv4Address,
    gateway: ipv4Address,
    dnsServers: z.array(ipv4Address),
    linkUp: z.boolean(),
  }),
  gateway: z.strictObject({
    ipAddress: ipv4Address,
    online: z.boolean(),
  }),
  dns: z.strictObject({
    servers: z
      .array(
        z.strictObject({
          ipAddress: ipv4Address,
          online: z.boolean(),
          records: z.record(hostname, ipv4Address),
        }),
      )
      .min(1),
  }),
  internet: z.strictObject({
    online: z.boolean(),
    reachableAddresses: z.array(ipv4Address),
  }),
})

export function isIpv4Address(value: string): boolean {
  const octets = value.split('.')

  return (
    octets.length === 4 &&
    octets.every(
      (octet) =>
        /^\d{1,3}$/.test(octet) &&
        Number(octet) <= 255 &&
        (octet === '0' || !octet.startsWith('0')),
    )
  )
}
