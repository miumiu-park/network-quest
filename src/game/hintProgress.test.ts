import { describe, expect, it } from 'vitest'
import { createHintProgress, revealNextHint } from './hintProgress'

const hints = ['first direction', 'second direction', 'final direction']

describe('Hint Progress', () => {
  it('reveals exactly one additional hint at a time', () => {
    const initial = createHintProgress(hints)
    const first = revealNextHint(hints, initial)
    const second = revealNextHint(hints, first)

    expect(initial).toMatchObject({ hintCount: 0, revealedHints: [] })
    expect(first).toMatchObject({
      hintCount: 1,
      revealedHints: ['first direction'],
      hasMoreHints: true,
    })
    expect(second).toMatchObject({
      hintCount: 2,
      revealedHints: ['first direction', 'second direction'],
      hasMoreHints: true,
    })
  })

  it('does not exceed the available hint stages', () => {
    let progress = createHintProgress(hints)
    for (let index = 0; index < 5; index += 1) {
      progress = revealNextHint(hints, progress)
    }

    expect(progress).toMatchObject({
      hintCount: 3,
      revealedHints: hints,
      hasMoreHints: false,
    })
    expect(revealNextHint(hints, progress)).toBe(progress)
  })
})
