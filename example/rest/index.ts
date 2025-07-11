import 'reflect-metadata'
import './application'

import { fetchRoutes } from 'helocore'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import MultiPart from '@fastify/multipart'
import RateLimit from '@fastify/rate-limit'

const UPLOAD_SIZE = 16000

function main() {

  const fastify = Fastify({
    logger: false,
    requestTimeout: 10000,
    bodyLimit: UPLOAD_SIZE
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
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 100,     // Max field value size in bytes
      fields: 10,         // Max number of non-file fields
      fileSize: UPLOAD_SIZE, // For multipart forms, the max file size in bytes
      files: 1,           // Max number of file fields
      headerPairs: 2000,  // Max number of header key=>value pairs
    }
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