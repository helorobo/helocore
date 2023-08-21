import { container } from "tsyringe"
import { TMiddlewareFuncs, definedMiddlewares, middlewareMetadataKey } from "./Controller"

export function Middleware<T extends readonly object[]>(middleware: [...TMiddlewareFuncs<T>]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(middlewareMetadataKey, {
      middlewares: middleware,
    }, target, propertyKey)
  }
}

export function defineMiddleware(target: Function) {
  const originalMethods = Object.getOwnPropertyNames(target.prototype)

  const middlewareClass = container.resolve(target as any)

  for (const method of originalMethods) {
    const originalMethod = target.prototype[method]
    if (originalMethod instanceof Function && method !== 'constructor') {
      definedMiddlewares.push({
        class: target,
        containered: middlewareClass as Function,
        func_name: method
      })
    }
  }
}