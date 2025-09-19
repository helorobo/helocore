import { z } from 'zod'
import { File, defineMiddleware, Query, singleton } from 'helocore'
import { TFile } from '../types'

const UPLOAD_SIZE = 200000

@defineMiddleware
@singleton()
export default class Validation {
  constructor() { }

  async FilterMimeType(@File('file',) file: TFile, @File('file_name',) fileName: TFile, @Query query: { name: string }) {
    if (file._buf.length > UPLOAD_SIZE) {
      throw new Error('Media Size Big. Limit is 16000 byte')
    }

    if (!fileName.value) {
      throw new Error('fileName not found')
    }

    const schema = z.object({
      name: z.string()
    })

    await schema.parseAsync(query)
  }

}