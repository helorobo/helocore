import 'reflect-metadata'
import './application'

import { MercuriusSetup } from 'helocore'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Types } from './src/schema'

function main() {

  const fastify = Fastify({
    logger: false,
    requestTimeout: 10000
  })

  fastify.register(cors)

  fastify.register((app, _, done) => {
    MercuriusSetup(app, Types)
    done()
  })

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