import type { Scenario } from './scenario'
import type { ScenarioValidationIssue } from './validateScenario'
import { validateScenario } from './validateScenario'

export type ScenarioLoadError =
  | {
      readonly code: 'INVALID_JSON'
      readonly message: 'Scenario source is not valid JSON'
    }
  | {
      readonly code: 'INVALID_SCENARIO'
      readonly message: 'Scenario data failed validation'
      readonly issues: readonly ScenarioValidationIssue[]
    }

export type ScenarioLoadResult =
  | { readonly success: true; readonly scenario: Scenario }
  | { readonly success: false; readonly error: ScenarioLoadError }

export function loadScenario(json: string): ScenarioLoadResult {
  let input: unknown

  try {
    input = JSON.parse(json)
  } catch {
    return {
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Scenario source is not valid JSON',
      },
    }
  }

  const validation = validateScenario(input)

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: 'INVALID_SCENARIO',
        message: 'Scenario data failed validation',
        issues: validation.error.issues,
      },
    }
  }

  return {
    success: true,
    scenario: validation.scenario,
  }
}
