import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { StageClearResult } from './StageClearResult'
import type { StageClearResult as StageClearResultModel } from './stageClearResultModel'

const levelUpResult: StageClearResultModel = {
  scenarioId: 'dns-slime',
  scenarioTitle: 'DNS Slimeの名前解決障害',
  enemyName: 'DNS Slime',
  rank: 'A',
  performance: {
    commandCount: 6,
    incorrectAnswerCount: 0,
    hintCount: 1,
  },
  expAwarded: 100,
  rewardExp: 100,
  isFirstClear: true,
  isNewBestRank: true,
  previousLevel: 1,
  currentLevel: 2,
  didLevelUp: true,
  learningTheme: 'Name Resolution',
  learningSummary: 'IP到達性と名前解決を順番に確認します。',
  learningKeyPoints: [
    'pingで到達性を確認する。',
    'nslookupで名前解決を確認する。',
  ],
  keyCommands: ['ip', 'ping', 'nslookup'],
  newAchievements: [
    {
      id: 'first-troubleshooter',
      name: 'First Troubleshooter',
      description: '初めてScenarioをクリアする。',
    },
  ],
}

describe('StageClearResult', () => {
  it('shows rank, performance, reward, level up and learning details', () => {
    render(
      <MemoryRouter>
        <StageClearResult result={levelUpResult} learningState={{}} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'DNS Slime 撃破！' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Stage Rank A')).toBeInTheDocument()
    expect(screen.getByText('NEW RECORD')).toBeInTheDocument()
    expect(screen.getByLabelText('Stage performance')).toHaveTextContent(
      'Commands6Wrong Answers0Hints1',
    )
    expect(
      screen.getByRole('heading', { name: '+100 EXP' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Lv.1 → Lv.2')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Achievement Unlocked!' }),
    ).toBeInTheDocument()
    expect(screen.getByText('First Troubleshooter')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: '今回学んだテーマ: Name Resolution',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '学習レビューへ進む' }),
    ).toHaveAttribute('href', '/learning')
  })

  it('explains that a replay does not award EXP again', () => {
    render(
      <MemoryRouter>
        <StageClearResult
          result={{
            ...levelUpResult,
            expAwarded: 0,
            isFirstClear: false,
            isNewBestRank: false,
            previousLevel: 2,
            currentLevel: 2,
            didLevelUp: false,
            newAchievements: [],
          }}
          learningState={{}}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '追加EXP 0' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/初回クリア報酬は獲得済み/)).toBeInTheDocument()
    expect(screen.queryByText('LEVEL UP')).not.toBeInTheDocument()
    expect(screen.queryByText('NEW RECORD')).not.toBeInTheDocument()
  })
})
