import { useId, useState, type FormEvent } from 'react'
import { parseCommand } from './commandParser'
import styles from './Terminal.module.css'
import type { TerminalExecutor, TerminalResult } from './terminalTypes'

interface TerminalEntry {
  readonly id: number
  readonly command: string
  readonly result: TerminalResult
}

export interface TerminalProps {
  readonly execute: TerminalExecutor
}

export function Terminal({ execute }: TerminalProps) {
  const inputId = useId()
  const [command, setCommand] = useState('')
  const [entries, setEntries] = useState<readonly TerminalEntry[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parseResult = parseCommand(command)
    if (!parseResult.ok) {
      setValidationError(parseResult.error.message)
      return
    }

    setValidationError(null)
    const result = execute(parseResult.value)
    const normalizedCommand = [
      parseResult.value.command,
      ...parseResult.value.args,
    ].join(' ')
    setEntries((currentEntries) => [
      ...currentEntries,
      { id: currentEntries.length + 1, command: normalizedCommand, result },
    ])
    setCommand('')
  }

  return (
    <section className={styles.terminal} aria-label="疑似Terminal">
      <header className={styles.header}>
        <span className={styles.status} aria-hidden="true" />
        <h2 className={styles.title}>Quest Terminal</h2>
        <span className={styles.badge}>SIMULATED</span>
      </header>

      <div className={styles.history} aria-live="polite" aria-label="実行履歴">
        {entries.length === 0 ? (
          <p className={styles.hint}>
            コマンドを入力して調査を開始してください。
          </p>
        ) : (
          entries.map((entry) => (
            <div className={styles.entry} key={entry.id}>
              <p className={styles.command}>
                <span aria-hidden="true">quest@lan:~$ </span>
                {entry.command}
              </p>
              <pre
                className={
                  entry.result.kind === 'error' ? styles.error : styles.output
                }
                role={entry.result.kind === 'error' ? 'alert' : undefined}
              >
                {entry.result.text}
              </pre>
            </div>
          ))
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor={inputId}>
          <span aria-hidden="true">$</span>
          <span className={styles.srOnly}>コマンド</span>
        </label>
        <input
          id={inputId}
          className={styles.input}
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          autoComplete="off"
          spellCheck="false"
          placeholder="例: ping gateway"
        />
        <button className={styles.button} type="submit">
          実行
        </button>
      </form>
      {validationError !== null && (
        <p className={styles.validationError} role="alert">
          {validationError}
        </p>
      )}
    </section>
  )
}
