import { getMetaData, runMiddleware, runPermissionControl, runPrefixMiddleware, TMiddlewareFuncs } from "../Controller"
import { GraphQLMethod } from "../types"
import { moduleList } from "../Modules"
import { SetupMercurius } from "./SetupMercurius"

export const mutationMetadataKey = Symbol("Mutation")
export const qqueryMetadataKey = Symbol("QQeury")

export function Mutation(key: string, schema: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(mutationMetadataKey, {
      type: GraphQLMethod.Mutation,
      resolver: [key, schema]
    }, target, propertyKey)
  }
}

export function QQuery(key: string, schema: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(qqueryMetadataKey, {
      type: GraphQLMethod.Query,
      resolver: [key, schema]
    }, target, propertyKey)
  }
}

export function QraphqlResolver<T extends readonly object[]>(middlewares: [...TMiddlewareFuncs<T>] = null) {
  return function (target: Function) {
    const originalMethods = Object.getOwnPropertyNames(target.prototype)

    for (const method of originalMethods) {
      const originalMethod = target.prototype[method]

      if (originalMethod instanceof Function && method !== 'constructor') {

        target.prototype[method] = async function (...args: any[]) {
          try {

            if (!middlewares) {
              middlewares = [] as any
            }

            // prefix middleware işlemleri yapılıyor
            await runPrefixMiddleware(args[2].reply.request, args[2].reply, middlewares)

            // yetki kontrolü yapılıyor
            await runPermissionControl(args[2].reply.request, args[2].reply, target.prototype, method)

            // middleware işlemleri yapılıyor
            await runMiddleware(args[2].reply.request, args[2].reply, target.prototype, method)

            const argument = await getMetaData(args[2].reply.request, args[2].reply, target.prototype, method, originalMethod.length)

            const selectInstance = moduleList.find(a => a instanceof target)

            return originalMethod.bind(selectInstance).apply(this, argument)
          } catch (error) {
            throw error
          }
        }

        // dinamik endpointler oluşturuluyor
        createMutations(target.prototype, method)
        createQueries(target.prototype, method)
      }
    }
  }
}

function createMutations(targetPrototype: Function, method: string) {
  const existsEndpoint: { resolver: [string, string], type: GraphQLMethod } = Reflect.getOwnMetadata(mutationMetadataKey, targetPrototype, method)
  if (existsEndpoint) {
    SetupMercurius.addResolver(existsEndpoint, targetPrototype[method])
  }
}

function createQueries(targetPrototype: Function, method: string) {
  const existsEndpoint: { resolver: [string, string], type: GraphQLMethod } = Reflect.getOwnMetadata(qqueryMetadataKey, targetPrototype, method)
  if (existsEndpoint) {
    SetupMercurius.addResolver(existsEndpoint, targetPrototype[method])
  }
}