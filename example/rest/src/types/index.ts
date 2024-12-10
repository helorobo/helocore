import { FastifyRequest } from 'fastify'

export type TFile = {
  data: Buffer
  encoding: string
  filename: string
  limit: boolean
  mimetype: string
}

export type RequestWithTrace = FastifyRequest & { trace_id: string }