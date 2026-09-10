import type { ParsedCommand } from './commandParser'

export type TerminalResult =
  | { readonly kind: 'output'; readonly text: string }
  | { readonly kind: 'error'; readonly text: string }

export type TerminalExecutor = (command: ParsedCommand) => TerminalResult
