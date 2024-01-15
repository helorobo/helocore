import { container, singleton } from "tsyringe"
import { EventEmitter } from "events"

export const eventList = []

export function EventsModule(modules: Array<Function>) {
  for (let i = 0; i < modules.length; i++) {
    eventList.push(container.resolve((modules[i] as any)))
  }
}

@singleton()
export class Events extends EventEmitter {
  constructor() {
    super()
  }
}

const events = container.resolve(Events)

export function OnEvent(eventName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    events.on(eventName, (data) => {
      return target[propertyKey].apply(this, [data])
    })
  }
}
