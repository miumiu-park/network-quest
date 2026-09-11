import { describe, expect, it } from 'vitest'
import {
  evaluateStageRank,
  STAGE_RANK_RULES,
  STAGE_RANKS,
  type StagePerformance,
} from './stageRank'

describe('stage rank evaluation', () => {
  it('publishes the supported ranks and their ordered limits', () => {
    expect(STAGE_RANKS).toEqual(['S', 'A', 'B', 'C'])
    expect(STAGE_RANK_RULES).toEqual([
      {
        rank: 'S',
        maxCommandCount: 4,
        maxIncorrectAnswerCount: 0,
        maxHintCount: 0,
      },
      {
        rank: 'A',
        maxCommandCount: 6,
        maxIncorrectAnswerCount: 1,
        maxHintCount: 1,
      },
      {
        rank: 'B',
        maxCommandCount: 10,
        maxIncorrectAnswerCount: 2,
        maxHintCount: 2,
      },
    ])
  })

  it.each([
    [{ commandCount: 4, incorrectAnswerCount: 0, hintCount: 0 }, 'S'],
    [{ commandCount: 5, incorrectAnswerCount: 0, hintCount: 0 }, 'A'],
    [{ commandCount: 4, incorrectAnswerCount: 1, hintCount: 0 }, 'A'],
    [{ commandCount: 4, incorrectAnswerCount: 0, hintCount: 1 }, 'A'],
    [{ commandCount: 7, incorrectAnswerCount: 1, hintCount: 1 }, 'B'],
    [{ commandCount: 6, incorrectAnswerCount: 2, hintCount: 1 }, 'B'],
    [{ commandCount: 6, incorrectAnswerCount: 1, hintCount: 2 }, 'B'],
    [{ commandCount: 11, incorrectAnswerCount: 0, hintCount: 0 }, 'C'],
    [{ commandCount: 4, incorrectAnswerCount: 3, hintCount: 0 }, 'C'],
    [{ commandCount: 4, incorrectAnswerCount: 0, hintCount: 3 }, 'C'],
  ] as const)('evaluates %o as rank %s', (performance, expectedRank) => {
    expect(evaluateStageRank(performance)).toBe(expectedRank)
  })

  it.each([
    ['commandCount', -1],
    ['incorrectAnswerCount', 1.5],
    ['hintCount', Number.NaN],
    ['hintCount', Number.POSITIVE_INFINITY],
  ] as const)('rejects invalid %s value %s', (field, value) => {
    const performance: StagePerformance = {
      commandCount: 0,
      incorrectAnswerCount: 0,
      hintCount: 0,
      [field]: value,
    }

    expect(() => evaluateStageRank(performance)).toThrow(
      `${field} must be a non-negative safe integer`,
    )
  })
})
