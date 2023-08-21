import { RateLimitOptions } from "@fastify/rate-limit"
import { FastifyRequest, RouteHandlerMethod } from "fastify"

export enum Method {
  Get = 'get',
  Post = 'post',
  Delete = 'delete',
  Put = 'put',
  Head = 'head',
  Patch = 'patch',
  Options = 'options'
}

export type EndpointData = {
  method: Method,
  prefix: string,
  endpoint: string,
}

export type RoutesData = {
  endpoint: EndpointData,
  controllerFunction: RouteHandlerMethod,
  rateLimit: RateLimitOptions
}

export type TCustomFastifyRequest = FastifyRequest & { trace_id: string }