import { FastifyRequest } from 'fastify'

export type TFile = {
  _buf?: Array<Buffer>
  data: Buffer
  encoding: string
  filename: string
  limit: boolean
  mimetype: string
  value?: string
}

export type RequestWithTrace = FastifyRequest & { trace_id: string }