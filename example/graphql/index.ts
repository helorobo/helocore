import 'reflect-metadata'
import './application'

import { MercuriusSetup } from 'helocore/src/qraphql/SetupMercurius'
import Fastify from 'fastify'
import cors from '@fastify/cors'

function main() {

  const fastify = Fastify({
    logger: false,
    requestTimeout: 10000
  })

  fastify.register(cors)

  fastify.register((app, _, done) => {
    MercuriusSetup(app)
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