import { z } from 'zod'
import { defineMiddleware, BodyVariables } from 'helocore'

@defineMiddleware
export default class Validation {
  constructor() { }

  async Test(@BodyVariables body) {
    const schema = z.object({
      name: z.string()
    })

    await schema.parseAsync(body)
  }

}