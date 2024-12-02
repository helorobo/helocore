import { createParamDecorator } from 'helocore'
import { FastifyRequest } from 'fastify'

export const CustomTest = createParamDecorator((req: FastifyRequest) => {
  return 'Something Data'
})