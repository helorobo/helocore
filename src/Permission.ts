import { container } from "tsyringe"
import { permissionMetadataKey } from "./Controller"

export function Permissions(...permissions: Array<string>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(permissionMetadataKey, {
      permissions
    }, target, propertyKey)
  }
}

/**
 * can use only 1 time
*/
export let definePermissionFunction = null as Function
export function definePermission(target: Function) {
  if (definePermissionFunction) {
    throw 'Already Defined Permission. Only 1 time use  \"definePermission\"'
  }
  definePermissionFunction = target
}

export interface IDefinePermission {
  CheckPermission(permissions: Array<string>, ...params: any): Promise<boolean>
}

export function PermissionModule<T extends IDefinePermission>(data: new (...a: any) => T) {
  permissionModule = container.resolve(data)
}
export let permissionModule: IDefinePermission = null