import { scenarioSchema, type Scenario } from './scenarioSchema'

export interface ScenarioValidationIssue {
  readonly code: string
  readonly path: string
  readonly message: string
}

export interface ScenarioValidationError {
  readonly message: 'Invalid scenario data'
  readonly issues: readonly ScenarioValidationIssue[]
}

export type ScenarioValidationResult =
  | { readonly success: true; readonly scenario: Scenario }
  | { readonly success: false; readonly error: ScenarioValidationError }

export function validateScenario(input: unknown): ScenarioValidationResult {
  const result = scenarioSchema.safeParse(input)

  if (result.success) {
    return { success: true, scenario: result.data }
  }

  return {
    success: false,
    error: {
      message: 'Invalid scenario data',
      issues: result.error.issues.map((issue) => ({
        code: issue.code,
        path: issue.path.map(String).join('.'),
        message: issue.message,
      })),
    },
  }
}
