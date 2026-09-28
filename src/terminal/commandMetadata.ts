import type { TerminalResult } from './terminalTypes'

export interface CommandMetadata {
  readonly name: string
  readonly description: string
  readonly usage: string
  readonly example: string
}

export const COMMAND_METADATA: readonly CommandMetadata[] = Object.freeze([
  Object.freeze({
    name: 'help',
    description: '利用可能なcommandと安全な使い方を表示します。',
    usage: 'help [command]',
    example: 'help ping',
  }),
  Object.freeze({
    name: 'ip',
    description: 'Clientのinterface設定を表示します。',
    usage: 'ip',
    example: 'ip',
  }),
  Object.freeze({
    name: 'ping',
    description: '指定したtargetへの到達性をSimulationで確認します。',
    usage: 'ping <target>',
    example: 'ping gateway',
  }),
  Object.freeze({
    name: 'nslookup',
    description: '指定したhostnameの名前解決をSimulationで確認します。',
    usage: 'nslookup <hostname>',
    example: 'nslookup example.test',
  }),
])

export function getCommandMetadata(
  commandName: string,
): CommandMetadata | undefined {
  return COMMAND_METADATA.find((command) => command.name === commandName)
}

export function createHelpResult(
  args: readonly string[],
  availableCommands: readonly string[],
): TerminalResult {
  if (args.length > 1) return createUsageError('help')

  const [requestedCommand] = args
  if (requestedCommand !== undefined) {
    const metadata = getCommandMetadata(requestedCommand)
    if (
      metadata === undefined ||
      !availableCommands.includes(requestedCommand)
    ) {
      return {
        kind: 'error',
        text: `help: unknown command: ${requestedCommand}\nRun "help" to list available commands.`,
      }
    }

    return {
      kind: 'output',
      text: [
        `${metadata.name} — ${metadata.description}`,
        `Usage: ${metadata.usage}`,
        `Example: ${metadata.example}`,
      ].join('\n'),
    }
  }

  const entries = COMMAND_METADATA.filter((metadata) =>
    availableCommands.includes(metadata.name),
  ).map((metadata) => `${metadata.name.padEnd(10)} ${metadata.description}`)

  return {
    kind: 'output',
    text: [
      'Available commands:',
      ...entries,
      '',
      'Run "help <command>" for usage and an example.',
    ].join('\n'),
  }
}

export function createUsageError(commandName: string): TerminalResult {
  const metadata = getCommandMetadata(commandName)
  return {
    kind: 'error',
    text:
      metadata === undefined
        ? `Invalid arguments. Run "help" for available commands.`
        : `usage: ${metadata.usage}\nRun "help ${commandName}" for details.`,
  }
}
