import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Terminal, type TerminalExecutor } from '../terminal'
import { APP_ROUTES } from './routes'

interface ScreenProps {
  readonly title: string
  readonly children?: ReactNode
}

function Screen({ title, children }: ScreenProps) {
  return (
    <main id="center">
      <h1>{title}</h1>
      {children}
    </main>
  )
}

function BattleRoute() {
  const { scenarioId } = useParams<'scenarioId'>()

  if (scenarioId === undefined) {
    return <Navigate to={APP_ROUTES.village} replace />
  }

  return (
    <Screen title="Battle">
      <p>Scenario: {scenarioId}</p>
      <Terminal execute={unavailableExecutor} />
    </Screen>
  )
}

const unavailableExecutor: TerminalExecutor = (command) => ({
  kind: 'error',
  text: `「${command}」はまだ利用できません。`,
})

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path={APP_ROUTES.home}
        element={<Navigate to={APP_ROUTES.village} replace />}
      />
      <Route
        path={APP_ROUTES.village}
        element={<Screen title="LAN Village" />}
      />
      <Route path={APP_ROUTES.battle} element={<BattleRoute />} />
      <Route path={APP_ROUTES.result} element={<Screen title="Result" />} />
      <Route path={APP_ROUTES.learning} element={<Screen title="Learning" />} />
    </Routes>
  )
}
