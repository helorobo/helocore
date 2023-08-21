import { container } from 'tsyringe'

export const moduleList = []

export function Modules(modules: Array<Function>) {
  for (let i = 0; i < modules.length; i++) {
    moduleList.push(container.resolve((modules[i] as any)))
  }
}

export const dataSourceList: Record<string, any> = {}

export function DataSource(modules: Object) {
  for (const [key, value] of Object.entries(modules)) {
    dataSourceList[key] = container.resolve(value)
  }
}