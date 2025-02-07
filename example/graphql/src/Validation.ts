import { z } from 'zod'
import { defineMiddleware, BodyVariables, singleton } from 'helocore'

@defineMiddleware
@singleton()
export default class Validation {
  constructor() { }

  async Test(@BodyVariables body) {
    const schema = z.object({
      name: z.string()
    })

    await schema.parseAsync(body)
  }

}