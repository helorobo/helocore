import { FastifyInstance, RouteHandlerMethod } from "fastify";
import mercurius from 'mercurius'
import { GraphQLMethod } from "../types";

export class SetupMercurius {
  static resolvers: Array<{
    resolver: {
      resolver: [string, string],
      type: GraphQLMethod
    },
    controllerFunction: Function
  }> = []

  static addResolver(resolver: { resolver: [string, string], type: GraphQLMethod }, controllerFunction: RouteHandlerMethod) {
    SetupMercurius.resolvers.push({
      resolver: resolver,
      controllerFunction: controllerFunction,
    })
  }

  fetchResolvers(fastify: FastifyInstance, types: string, graphiql: boolean = true) {
    const resolvers = {} as any

    const mutations = []
    const queries = []

    for (const resolver of SetupMercurius.resolvers) {
      if (resolver.resolver.type === GraphQLMethod.Mutation) {
        if (!resolvers.Mutation) {
          resolvers.Mutation = {}
        }

        resolvers.Mutation[resolver.resolver.resolver[0]] = resolver.controllerFunction

        mutations.push(resolver.resolver.resolver[1])
      } else if (resolver.resolver.type === GraphQLMethod.Query) {
        if (!resolvers.Query) {
          resolvers.Query = {}
        }

        resolvers.Query[resolver.resolver.resolver[0]] = resolver.controllerFunction

        queries.push(resolver.resolver.resolver[1])
      }
    }

    let mutation = ''
    if (mutations.length > 0) {
      mutation = `
        type Mutation {
          ${mutations.join('\n')}
        }`
    }

    let query = ''
    if (queries.length > 0) {
      query = `
        type Query {
          ${queries.join('\n')}
        }`
    }

    const schema = mutation + query + types

    // Mercurius ile GraphQL Entegrasyonu
    fastify.register(mercurius, {
      schema,
      resolvers,
      graphiql: graphiql, // GraphQL arayüzü etkinleştir
    });
  }
}

export const MercuriusSetup = (fastify: FastifyInstance, types: string) => new SetupMercurius().fetchResolvers(fastify, types)