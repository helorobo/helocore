import { z } from 'zod'
import { File, defineMiddleware, Query, singleton } from 'helocore'
import { TFile } from '../types'

@defineMiddleware
@singleton()
export default class Validation {
  constructor() { }

  async FilterMimeType(@File('file',) file: Array<TFile>, @Query query: { name: string }) {
    if (file[0].limit) {
      throw new Error('Media Size Big. Limit is 16000 byte')
    }

    const schema = z.object({
      name: z.string()
    })

    await schema.parseAsync(query)
  }

}