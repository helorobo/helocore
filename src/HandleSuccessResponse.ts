import { FastifyRequest } from "fastify"

export let handleSuccessFunction: Function = null

/**
 * 
 * Only work for Rest API
 */
export function HandleSuccessResponse<T>(func: (req: FastifyRequest, response: T) => void) {
  handleSuccessFunction = func
}