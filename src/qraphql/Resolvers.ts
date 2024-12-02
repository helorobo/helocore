import { TMiddlewareFuncs } from "../Controller"
import { GraphQLMethod } from "../types"
import { SetupMercurius } from "./SetupMercurius"

export const mutationMetadataKey = Symbol("Mutation")
export const qqueryMetadataKey = Symbol("QQeury")

export function Mutation(a: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(mutationMetadataKey, {
      type: GraphQLMethod.Mutation,
      resolver: a
    }, target, propertyKey)
  }
}

export function QQuery(a: string) {
  console.log(a)
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(qqueryMetadataKey, {
      type: GraphQLMethod.Query,
      resolver: a
    }, target, propertyKey)
  }
}

export function QraphqlResolver<T extends readonly object[]>() {
  return function (target: Function) {
    const originalMethods = Object.getOwnPropertyNames(target.prototype)

    for (const method of originalMethods) {
      const originalMethod = target.prototype[method]

      if (originalMethod instanceof Function && method !== 'constructor') {

        target.prototype[method] = async function (...args: any[]) {
          console.log(args)
          // prefix middleware işlemleri yapılıyor
          // await runPrefixMiddleware(args[0], args[1], middlewares)

          // yetki kontrolü yapılıyor
          // await runPermissionControl(args[0], args[1], target.prototype, method)

          // middleware işlemleri yapılıyor
          // await runMiddleware(args[0], args[1], target.prototype, method)

          // controller çalışıyor
          // await runController(args[0], args[1], target, method, originalMethod)

        }

        // dinamik endpointler oluşturuluyor
        createMutations(target.prototype, method)
        createQueries(target.prototype, method)
      }
    }
  }
}

function createMutations(targetPrototype: Function, method: string) {
  const existsEndpoint: { resolver: string, type: GraphQLMethod } = Reflect.getOwnMetadata(mutationMetadataKey, targetPrototype, method)
  if (existsEndpoint) {
    SetupMercurius.addResolver(existsEndpoint, targetPrototype[method])
  }
}

function createQueries(targetPrototype: Function, method: string) {
  const existsEndpoint: { resolver: string, type: GraphQLMethod } = Reflect.getOwnMetadata(qqueryMetadataKey, targetPrototype, method)
  if (existsEndpoint) {
    SetupMercurius.addResolver(existsEndpoint, targetPrototype[method])
  }
}