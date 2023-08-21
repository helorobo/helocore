import pino from "pino"
import enums from "./libs/enums"

export function Service(target: Function) {
  const originalMethods = Object.getOwnPropertyNames(target.prototype)

  for (const method of originalMethods) {
    const originalMethod = target.prototype[method]

    if (originalMethod instanceof Function && method !== 'constructor') {
      target.prototype[method] = async function (...args: any) {
        try {

          pino().info({
            step: enums.steps.service,
            timestamp: new Date()
          })

          return await originalMethod.apply(this, [...args])
        } catch (error) {
          pino().error({
            step: enums.steps.service,
            error: error.message,
            timestamp: new Date()
          })

          throw error
        }
      }
    }
  }
}