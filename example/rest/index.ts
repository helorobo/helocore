import 'reflect-metadata'
import './application'

import { fetchRoutes } from 'helocore'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import MultiPart from '@fastify/multipart'
import RateLimit from '@fastify/rate-limit'

function main() {

  const fastify = Fastify({
    logger: false,
    requestTimeout: 10000,
  })

  fastify.register(cors)
  fastify.register(RateLimit, {
    errorResponseBuilder: function (request, context) {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${context.after}. Try again soon.`,
        expiresIn: Math.ceil(context.ttl / 1000)// seconds
      }
    }
  })
  fastify.register(MultiPart, {
    attachFieldsToBody: true,
    throwFileSizeLimit: false,
  })

  fastify.register((app, _, done) => {
    fetchRoutes(app)
    done()
  }, { prefix: '/api/v1' })

  const PORT = 3500

  fastify.listen({ port: PORT }, (err) => {
    if (err) {
      console.log(err)
      return process.exit(1)
    }
    console.log('🟢 Example is Running on Port ', PORT)
  })
}

main()