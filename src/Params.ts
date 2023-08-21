import {
  bodyMetadataKey,
  headersMetadataKey,
  paramsMetadataKey,
  queryMetadataKey,
  replyMetadataKey,
  requestMetadataKey,
  fileMetadataKey
} from "./Controller"

export function Request(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  Reflect.defineMetadata(requestMetadataKey, [parameterIndex], target, propertyKey)
}

export function Body(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  Reflect.defineMetadata(bodyMetadataKey, [parameterIndex], target, propertyKey)
}

export function Params(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  Reflect.defineMetadata(paramsMetadataKey, [parameterIndex], target, propertyKey)
}

export function Query(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  Reflect.defineMetadata(queryMetadataKey, [parameterIndex], target, propertyKey)
}

export function Headers(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  Reflect.defineMetadata(headersMetadataKey, [parameterIndex], target, propertyKey)
}

export function Reply(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  Reflect.defineMetadata(replyMetadataKey, [parameterIndex], target, propertyKey)
}

// daha sonra export edilecek
function File(field: string) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    Reflect.defineMetadata(fileMetadataKey, { field: field, index: [parameterIndex] }, target, propertyKey)
  }
}