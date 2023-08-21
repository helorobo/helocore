import { FastifyRequest } from "fastify"
import { customDecorators } from "./Controller"

export type CustomDecorator = (req: FastifyRequest) => void

export function createParamDecorator(param: CustomDecorator) {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    customDecorators.push({
      class: target,
      func: param,
      func_name: propertyKey,
      parameter_index: parameterIndex
    })
  }
}