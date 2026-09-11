import { createObservations, type InvestigationHistory } from '../investigation'
import type { TerminalExecutor } from './terminalTypes'

export function createInvestigatedExecutor(
  execute: TerminalExecutor,
  history: InvestigationHistory,
): TerminalExecutor {
  return (command) => {
    const result = execute(command)

    history.addEntry({
      command: command.command,
      args: command.args,
      result,
      observations: createObservations(command, result),
    })

    return result
  }
}
