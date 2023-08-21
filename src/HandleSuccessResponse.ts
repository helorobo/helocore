import { FastifyRequest } from "fastify"

export let handleSuccessFunction: Function = null

export function HandleSuccessResponse<T>(func: (req: FastifyRequest, response: T) => void) {
  handleSuccessFunction = func
}