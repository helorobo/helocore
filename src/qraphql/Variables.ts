export const variablesMetadataKey = Symbol("Variables")

/**
 * 
 * Graphql Body Variables
 */
export function Variables(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  Reflect.defineMetadata(variablesMetadataKey, [parameterIndex], target, propertyKey)
}
