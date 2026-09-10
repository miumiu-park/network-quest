const MAX_INPUT_LENGTH = 256
const COMMAND_PATTERN = /^[a-z][a-z0-9-]*$/
const ARGUMENT_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/

export interface ParsedCommand {
  readonly command: string
  readonly args: readonly string[]
}

export type CommandParseErrorCode =
  'EMPTY_INPUT' | 'INPUT_TOO_LONG' | 'INVALID_COMMAND' | 'INVALID_ARGUMENT'

export interface CommandParseError {
  readonly code: CommandParseErrorCode
  readonly message: string
}

export type CommandParseResult =
  | { readonly ok: true; readonly value: ParsedCommand }
  | { readonly ok: false; readonly error: CommandParseError }

/**
 * Parses the deliberately small Network Quest command grammar.
 *
 * This is not a shell parser: quoting, escaping, expansion, redirection and
 * operators are intentionally unsupported.
 */
export function parseCommand(input: string): CommandParseResult {
  const normalizedInput = input.trim()

  if (normalizedInput.length === 0) {
    return failure('EMPTY_INPUT', 'コマンドを入力してください。')
  }

  if (normalizedInput.length > MAX_INPUT_LENGTH) {
    return failure(
      'INPUT_TOO_LONG',
      `コマンドは${MAX_INPUT_LENGTH}文字以内で入力してください。`,
    )
  }

  const [command, ...args] = normalizedInput.split(/[ \t]+/)

  if (!COMMAND_PATTERN.test(command)) {
    return failure('INVALID_COMMAND', 'コマンド名の形式が正しくありません。')
  }

  const invalidArgument = args.find(
    (argument) => !ARGUMENT_PATTERN.test(argument),
  )
  if (invalidArgument !== undefined) {
    return failure(
      'INVALID_ARGUMENT',
      `引数「${invalidArgument}」の形式が正しくありません。`,
    )
  }

  return {
    ok: true,
    value: { command, args },
  }
}

function failure(
  code: CommandParseErrorCode,
  message: string,
): CommandParseResult {
  return { ok: false, error: { code, message } }
}
