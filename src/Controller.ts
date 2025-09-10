import pino from "pino"
import { FastifyReply, RouteShorthandOptions } from "fastify"
import { customAlphabet } from 'nanoid'
import { Routes } from "./Routes"
import { permissionModule, definePermissionFunction } from "./Permission"

import { EndpointData, TCustomFastifyRequest } from "./types"

import enums from "./libs/enums"
import { RateLimitOptions } from "@fastify/rate-limit"
import { moduleList } from "./Modules"
import { handleErrorFunction } from "./HandleErrorResponse"
import { coreSettings } from "./Settings"
import { bodyVariablesMetadataKey, bodyQueryMetadataKey } from "./qraphql"

export const requestMetadataKey = Symbol("Request")
export const bodyMetadataKey = Symbol("Body")
export const paramsMetadataKey = Symbol("Params")
export const queryMetadataKey = Symbol("Query")
export const headersMetadataKey = Symbol("Headers")
export const replyMetadataKey = Symbol("Reply")
export const middlewareMetadataKey = Symbol('middleware')
export const permissionMetadataKey = Symbol('permission')
export const fileMetadataKey = Symbol('file')
export const rateLimitMetadataKey = Symbol('rateLimit')
export const endpointOptionsMetadataKey = Symbol('endpointOptions')
export const routesMetadataKey = 'routes'
export const customDecorators: Array<CustomDecoratorList> = []
export const definedMiddlewares: Array<TDefinedMiddlewares> = []

type CustomDecoratorList = {
  class: Object,
  func: Function,
  func_name: string,
  parameter_index: number
}

type TDefinedMiddlewares = {
  class: Function,
  containered: Function,
  func_name: string
}

type FileType = { field: string, index: number[] }

export async function runPrefixMiddleware<T extends readonly object[]>(req: TCustomFastifyRequest, res: FastifyReply, middlewares: [...TMiddlewareFuncs<T>]) {
  try {
    for (const middleware of middlewares) {
      for (const func of middleware.funcs) {
        const middlewareClass = definedMiddlewares.find(a => a.class === middleware.class && a.func_name === func) as any
        if (middlewareClass) {
          const args1 = await getMetaData(req, res, middlewareClass.class.prototype, (func as string), middlewareClass.containered[func].length)
          await middlewareClass.class.prototype[func].bind(middlewareClass.containered).apply(this, args1)
        }
      }
    }
  } catch (error) {
    if (coreSettings.logger) {
      pino().error({
        trace_id: req.trace_id,
        timestamp: new Date(),
        message: 'Prefix middleware Error',
        error: typeof error === 'object' ? JSON.stringify(error) : error
      })
    }

    throw error
  }
}

export async function runPermissionControl(req: TCustomFastifyRequest, res: FastifyReply, targetPrototype: Function, method: string) {
  try {
    if (definePermissionFunction) {
      const permissions = Reflect.getOwnMetadata(permissionMetadataKey, targetPrototype, method) as { permissions: Array<string> }
      if (permissions) {
        const args1 = await getMetaData(req, res, definePermissionFunction.prototype, permissionModule.CheckPermission.name, permissionModule.CheckPermission.length) as Array<Object>
        await permissionModule.CheckPermission.bind(permissionModule).apply(this, [permissions.permissions, ...args1])
      }
    }
  } catch (error) {
    if (coreSettings.logger) {
      pino().error({
        trace_id: req.trace_id,
        timestamp: new Date(),
        message: 'Permission Middleware Error',
        error: typeof error === 'object' ? JSON.stringify(error) : error
      })
    }

    throw error
  }
}

export async function runMiddleware(req: TCustomFastifyRequest, res: FastifyReply, targetPrototype: Function, method: string) {
  try {
    const getMiddlewares = Reflect.getOwnMetadata(middlewareMetadataKey, targetPrototype, method)
    if (getMiddlewares) {
      for (const middleware of getMiddlewares.middlewares) {
        for (const func of middleware.funcs) {
          const middlewareClass = definedMiddlewares.find(a => a.class === middleware.class && a.func_name === func)
          if (middlewareClass) {
            const args1 = await getMetaData(req, res, middlewareClass.class.prototype, func, middlewareClass.containered[func].length)
            await middlewareClass.class.prototype[func].bind(middlewareClass.containered).apply(this, args1)
          }
        }
      }
    }
  } catch (error) {
    if (coreSettings.logger) {
      pino().error({
        trace_id: req.trace_id,
        timestamp: new Date(),
        message: 'Controller Middleware Error',
        error: typeof error === 'object' ? JSON.stringify(error) : error
      })
    }

    throw error
  }
}

function createDynamicEndpoints(prefix: string, targetPrototype: Function, method: string) {
  const existsEndpoint: EndpointData = Reflect.getOwnMetadata(routesMetadataKey, targetPrototype, method)
  if (existsEndpoint) {
    const rateLimit: RateLimitOptions = Reflect.getOwnMetadata(rateLimitMetadataKey, targetPrototype, method)
    existsEndpoint.prefix = prefix

    const endpointOptions: RouteShorthandOptions = Reflect.getOwnMetadata(endpointOptionsMetadataKey, targetPrototype, method)

    Routes.addRoute(existsEndpoint, targetPrototype[method], rateLimit, endpointOptions)
  }
}

async function runController(req: TCustomFastifyRequest, res: FastifyReply, target: Function, method: string, originalMethod: Function, setRequestSocketStatus: () => void, requestStatus: boolean) {
  try {
    const args1 = await getMetaData(req, res, target.prototype, method, originalMethod.length)

    const selectInstance = moduleList.find(a => a instanceof target)

    req.socket.on('end', setRequestSocketStatus)
    const response = await originalMethod.bind(selectInstance).apply(this, args1)

    if (!requestStatus) {
      req.socket.removeListener('end', setRequestSocketStatus)
      return
    }

    if (response) {
      response.trace_id = req.trace_id

      return res.status(response.status_code || 200).send(response)
    }
  } catch (error) {
    if (coreSettings.logger) {
      pino().error({
        trace_id: req.trace_id,
        timestamp: new Date(),
        message: 'Controller Error',
        error: typeof error === 'object' ? JSON.stringify(error) : error
      })
    }

    throw error
  }
}

export function Controller<T extends readonly object[]>(prefix: string = '', middlewares: [...TMiddlewareFuncs<T>] = null) {
  return function (target: Function) {
    const originalMethods = Object.getOwnPropertyNames(target.prototype)

    for (const method of originalMethods) {
      const originalMethod = target.prototype[method]

      if (originalMethod instanceof Function && method !== 'constructor') {

        target.prototype[method] = async function (...args: any[]) {
          if (!args[0].trace_id) {
            args[0].trace_id = customAlphabet('1234567890abcdefghijklmnoprstuvyzwqx', 30)().toLowerCase()
          }

          let requestStatus = true
          function setRequestSocketStatus() {
            requestStatus = false
          }

          if (!middlewares) {
            middlewares = [] as any
          }

          try {
            // prefix middleware işlemleri yapılıyor
            await runPrefixMiddleware(args[0], args[1], middlewares)

            // yetki kontrolü yapılıyor
            await runPermissionControl(args[0], args[1], target.prototype, method)

            // middleware işlemleri yapılıyor
            await runMiddleware(args[0], args[1], target.prototype, method)

            // controller çalışıyor
            await runController(args[0], args[1], target, method, originalMethod, setRequestSocketStatus, requestStatus)
          } catch (error) {
            if (!handleErrorFunction) {
              return args[1].status(400).send(error.message)
            }

            const serviceResponse = await handleErrorFunction(error, args[0].trace_id, enums.steps.controller, args[0].headers['accept-language'])

            args[1].status(serviceResponse.status_code).send(serviceResponse)
          }
          return args[0].socket.removeListener('end', setRequestSocketStatus)
        }

        // dinamik endpointler oluşturuluyor
        createDynamicEndpoints(prefix, target.prototype, method)
      }
    }
  }
}

type KeysMatching<T, V> = keyof { [K in keyof T as T[K] extends V ? K : never]: any }

export type TMiddlewareFuncs<T> = { [I in keyof T]: {
  funcs: ReadonlyArray<KeysMatching<T[I], Function>>
  class: new (...a: any) => T[I]
} }

export async function getMetaData(req: TCustomFastifyRequest, res: FastifyReply, target: Function, method: string, paramsCount: number): Promise<Object> {
  const args = []

  const requestParameters: number[] = Reflect.getOwnMetadata(requestMetadataKey, target, method)
  if (requestParameters) {
    args.push({ id: requestParameters, data: req })
  }

  const bodyParameters: number[] = Reflect.getOwnMetadata(bodyMetadataKey, target, method)
  if (bodyParameters) {
    args.push({ id: bodyParameters, data: req.body })
  }

  const paramsParameters: number[] = Reflect.getOwnMetadata(paramsMetadataKey, target, method)
  if (paramsParameters) {
    args.push({ id: paramsParameters, data: req.params })
  }

  const queryParameters: number[] = Reflect.getOwnMetadata(queryMetadataKey, target, method)
  if (queryParameters) {
    args.push({ id: queryParameters, data: req.query })
  }

  const headersParameters: number[] = Reflect.getOwnMetadata(headersMetadataKey, target, method)
  if (headersParameters) {
    args.push({ id: headersParameters, data: req.headers })
  }

  const replyParameters: number[] = Reflect.getOwnMetadata(replyMetadataKey, target, method)
  if (replyParameters) {
    args.push({ id: replyParameters, data: res })
  }

  const bodyVariablesParameters: number[] = Reflect.getOwnMetadata(bodyVariablesMetadataKey, target, method)
  if (bodyVariablesParameters) {
    args.push({ id: bodyVariablesParameters, data: (<any>req.body).variables })
  }

  const bodyQueryParameters: number[] = Reflect.getOwnMetadata(bodyQueryMetadataKey, target, method)
  if (bodyQueryParameters) {
    args.push({ id: bodyQueryParameters, data: (<any>req.body).query })
  }

  const fileParameters: FileType = Reflect.getOwnMetadata(fileMetadataKey, target, method)
  if (fileParameters) {
    try {
      if (!req.body[fileParameters.field]) {
        throw new Error("File not Found")
      }

      args.push({ id: fileParameters.index, data: req.body[fileParameters.field] })
    } catch (error) {
      throw new Error("Request Body not Found")
    }
  }

  // custom decoratorler tek bir symbol den geldiği için tüm hepsini arayıp fonksiyona veriyoruz
  for (let index = 0; index < paramsCount; index++) {
    const isThere = args.find(a => a.id[0] === index)
    if (isThere) {
      continue
    }

    const customParameters = customDecorators.find(a => a.class === target && a.func_name === method && a.parameter_index === index)
    if (customParameters) {
      const passData = await customParameters.func(req)

      args.push({ id: customParameters.parameter_index, data: passData })
    }
  }

  return args.sort((a, b) => a.id - b.id).map(a => a.data)
}