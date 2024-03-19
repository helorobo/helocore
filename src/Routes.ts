import { FastifyInstance, RouteHandlerMethod, RouteShorthandOptions } from "fastify"
import { RateLimitOptions } from "@fastify/rate-limit"
import { EndpointData, RoutesData } from "./types"

export class Routes {
  static routes: Array<RoutesData> = []

  static addRoute(endpoint: EndpointData, controllerFunction: RouteHandlerMethod, rateLimit: RateLimitOptions, endpointOptions?: RouteShorthandOptions) {
    Routes.routes.push({
      endpoint: endpoint,
      controllerFunction: controllerFunction,
      rateLimit: rateLimit,
      endpointOptions: endpointOptions || null
    })
  }

  fetchRoutes(fastify: FastifyInstance) {
    for (const route of Routes.routes) {
      let endpoint = null
      if (route.endpoint.prefix !== '/') {
        endpoint = route.endpoint.prefix + route.endpoint.endpoint
      } else {
        endpoint = route.endpoint.endpoint
      }

      if (endpoint.substring(endpoint.length - 1, endpoint.length) === '/') {
        endpoint = endpoint.substring(0, endpoint.length - 1)
      }

      if (route.endpointOptions) {
        fastify.route({
          method: route.endpoint.method,
          url: endpoint,
          handler: route.controllerFunction,
          bodyLimit: route.endpointOptions.bodyLimit || 1048576,
          config: route.rateLimit ? { rateLimit: route.rateLimit } : {}
        })
      } else {
        if (route.rateLimit) {
          fastify[route.endpoint.method](endpoint, { config: { rateLimit: route.rateLimit } }, route.controllerFunction)
        } else {
          fastify[route.endpoint.method](endpoint, route.controllerFunction)
        }
      }

      console.log('\u001B[92m' + route.endpoint.method.toUpperCase() + '\u001B[0m', '\u001B[95m->\u001B[0m', '\u001B[94m' + fastify.prefix + endpoint + '\u001B[0m')
    }
  }
}

export const fetchRoutes = (fastify: FastifyInstance) => new Routes().fetchRoutes(fastify)