import { RouteShorthandOptions } from "fastify"
import { endpointOptionsMetadataKey } from "./Controller"

export function EndpointOptions(options: RouteShorthandOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(endpointOptionsMetadataKey, options, target, propertyKey)
  }
}