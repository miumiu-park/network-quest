import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)

export const scenarioSchema = z.strictObject({
  id: nonEmptyString.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: nonEmptyString,
  enemy: z.strictObject({
    id: nonEmptyString,
    name: nonEmptyString,
    maxHp: z.number().int().positive(),
  }),
  network: z
    .record(nonEmptyString, z.json())
    .refine((network) => Object.keys(network).length > 0, {
      message: 'Network configuration must not be empty',
    }),
  failure: z.strictObject({
    type: nonEmptyString,
    description: nonEmptyString,
  }),
  answer: z.strictObject({
    cause: nonEmptyString,
  }),
  reward: z.strictObject({
    exp: z.number().int().nonnegative(),
  }),
  learning: z.strictObject({
    summary: nonEmptyString,
    keyPoints: z.array(nonEmptyString).min(1),
  }),
})

export type Scenario = z.infer<typeof scenarioSchema>
