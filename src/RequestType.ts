import { routesMetadataKey } from "./Controller"
import { Method } from "./types"

export function Get(endpoint: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(routesMetadataKey, {
      method: Method.Get,
      endpoint: endpoint
    }, target, propertyKey)
  }
}

export function Post(endpoint: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(routesMetadataKey, {
      method: Method.Post,
      endpoint: endpoint
    }, target, propertyKey)
  }
}

export function Delete(endpoint: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(routesMetadataKey, {
      method: Method.Delete,
      endpoint: endpoint
    }, target, propertyKey)
  }
}

export function Put(endpoint: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(routesMetadataKey, {
      method: Method.Put,
      endpoint: endpoint
    }, target, propertyKey)
  }
}

export function Head(endpoint: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(routesMetadataKey, {
      method: Method.Head,
      endpoint: endpoint
    }, target, propertyKey)
  }
}

export function Patch(endpoint: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(routesMetadataKey, {
      method: Method.Patch,
      endpoint: endpoint
    }, target, propertyKey)
  }
}

export function Options(endpoint: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(routesMetadataKey, {
      method: Method.Options,
      endpoint: endpoint
    }, target, propertyKey)
  }
}