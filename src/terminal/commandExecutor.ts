import type { TerminalExecutor, TerminalResult } from './terminalTypes'
import { createHelpResult } from './commandMetadata'

export type CommandHandler = (args: readonly string[]) => TerminalResult

export type CommandHandlerRegistry = Readonly<Record<string, CommandHandler>>

/**
 * Creates an executor that can dispatch only to explicitly registered handlers.
 * Parsed command data is never evaluated or forwarded to an OS shell.
 */
export function createCommandExecutor(
  handlers: CommandHandlerRegistry,
): TerminalExecutor {
  const availableCommands = Object.freeze(['help', ...Object.keys(handlers)])

  return ({ command, args }) => {
    if (command === 'help') {
      return createHelpResult(args, availableCommands)
    }

    if (!Object.hasOwn(handlers, command)) {
      return {
        kind: 'error',
        text: `command not found: ${command}\nRun "help" to list available commands.`,
      }
    }

    return handlers[command](args)
  }
}
