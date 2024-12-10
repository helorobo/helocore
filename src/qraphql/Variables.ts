export const bodyVariablesMetadataKey = Symbol("BodyVariables")
export const bodyQueryMetadataKey = Symbol("BodyQuery")

/**
 * 
 * Graphql Body Variables
 */
export function BodyVariables(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  Reflect.defineMetadata(bodyVariablesMetadataKey, [parameterIndex], target, propertyKey)
}

/**
 * 
 * Graphql Body Query
 */
export function BodyQuery(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  Reflect.defineMetadata(bodyQueryMetadataKey, [parameterIndex], target, propertyKey)
}
