import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the starter screen and updates the counter', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Get started' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Count is 0' }))

    expect(
      screen.getByRole('button', { name: 'Count is 1' }),
    ).toBeInTheDocument()
  })
})
