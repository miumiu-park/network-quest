import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'
import { APP_ROUTES } from './app/routes'

function renderRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('defines every application URL', () => {
    expect(APP_ROUTES).toEqual({
      home: '/',
      village: '/village',
      battle: '/battle/:scenarioId',
      result: '/result',
      learning: '/learning',
    })
  })

  it('redirects the home URL to LAN Village', () => {
    renderRoute('/')

    expect(
      screen.getByRole('heading', { name: 'LAN Village' }),
    ).toBeInTheDocument()
  })

  it.each([
    ['/village', 'LAN Village'],
    ['/result', 'Result'],
    ['/learning', 'Learning'],
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
})
