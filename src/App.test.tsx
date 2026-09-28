import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { APP_ROUTES } from './app/routes'
import { PLAYER_PROGRESS_STORAGE_KEY } from './storage'

function renderRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

afterEach(() => localStorage.clear())

describe('App routing', () => {
  it('defines every application URL', () => {
    expect(APP_ROUTES).toEqual({
      home: '/',
      village: '/village',
      event: '/event/:scenarioId',
      battle: '/battle/:scenarioId',
      result: '/result',
      learning: '/learning',
      codex: '/codex',
    })
  })

  it('redirects the home URL to LAN Village', () => {
    renderRoute('/')

    expect(
      screen.getByRole('heading', { name: 'LAN Village' }),
    ).toBeInTheDocument()
  })

  it('restores the Player Status from saved progress', () => {
    localStorage.setItem(
      PLAYER_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        level: 2,
        exp: 100,
        completedScenarios: ['ip-slime'],
        unlockedCommands: [],
        bestRanks: { 'ip-slime': 'A' },
      }),
    )

    renderRoute('/village')

    expect(
      screen.getByRole('region', { name: 'Network Adventurer' }),
    ).toHaveTextContent('Level2Experience100 / 300 EXP')
    expect(screen.getByRole('button', { name: /IP Slime/ })).toHaveTextContent(
      'クリア済み',
    )
  })

  it.each([
    ['/village', 'LAN Village'],
    ['/event/dns-slime', 'NPC Event'],
    ['/event/gateway-goblin', 'NPC Event'],
    ['/event/ip-slime', 'NPC Event'],
    ['/event/subnet-golem', 'NPC Event'],
    ['/result', 'Result'],
    ['/learning', 'Learning'],
    ['/codex', 'Network / Monster図鑑'],
  ])('renders %s as the %s screen', (route, heading) => {
    renderRoute(route)

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('uses only the scenario ID from the Battle URL', () => {
    renderRoute('/battle/dns-slime?status=CLEARED&enemyHp=0')

    expect(screen.getByRole('heading', { name: 'Battle' })).toBeInTheDocument()
    expect(screen.getByText('Scenario: dns-slime')).toBeInTheDocument()
    expect(screen.queryByText('CLEARED')).not.toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('starts the Battle from the NPC Event', async () => {
    const user = userEvent.setup()
    renderRoute('/event/dns-slime')

    await user.click(screen.getByRole('link', { name: '調査を開始' }))

    expect(screen.getByRole('heading', { name: 'Battle' })).toBeInTheDocument()
    expect(screen.getByText('Scenario: dns-slime')).toBeInTheDocument()
  })
})
