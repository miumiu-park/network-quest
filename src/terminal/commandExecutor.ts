import type { TerminalExecutor, TerminalResult } from './terminalTypes'

export type CommandHandler = (args: readonly string[]) => TerminalResult

export type CommandHandlerRegistry = Readonly<Record<string, CommandHandler>>

/**
 * Creates an executor that can dispatch only to explicitly registered handlers.
 * Parsed command data is never evaluated or forwarded to an OS shell.
 */
export function createCommandExecutor(
  handlers: CommandHandlerRegistry,
): TerminalExecutor {
  return ({ command, args }) => {
    if (!Object.hasOwn(handlers, command)) {
      return {
        kind: 'error',
        text: `command not found: ${command}`,
      }
    }

    return handlers[command](args)
  }
}
