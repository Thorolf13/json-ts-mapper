export type Context = { [name: string]: any };

export abstract class JsonMapper<T>{

  abstract serialize(obj: T, context?: Context): any;
  abstract deserialize(obj: any, context?: Context): T;

  abstract requiredContextKeys(): { serialize?: string[], deserialize?: string[] } | void;
}
