import { RateLimitOptions } from "@fastify/rate-limit"
import { rateLimitMetadataKey } from "./Controller"

export function RateLimit(rateLimit: RateLimitOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(rateLimitMetadataKey, rateLimit, target, propertyKey)
  }
}