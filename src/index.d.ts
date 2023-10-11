interface Class_ {
  [key: string]: any;
}

declare module "json-ts-mapper" {
  //json types
  type JsonProperty = null | string | number | boolean | Json;
  type Json = {
    [key: string]: JsonProperty | JsonProperty[];
  };

  //ts type
  class Any { }

  //converter
  class AbstractJsonConverter<JsonType extends string | number | boolean | {
    [key: string]: any;
  }, TsType> {
    serialize (obj: TsType): JsonType;
    deserialize (obj: JsonType): TsType;
  }

  //annotations
  function JsonProperty (expectedType?: {
    new(): {};
  } | {
    new(): {};
  }[], jsonPropertyName?: string): (target: any, classPropertyName: string) => void;
  function Optional (): (target: any, classPropertyName: string) => void;
  function NotNull (): (target: any, classPropertyName: string) => void;
  function Converter (customMapper: new () => AbstractJsonConverter<any, any> | AbstractJsonConverter<any, any>): (target: any, classPropertyName: string) => void;


  //service
  const JsonTsMapper: {
    isMapped (target: any): boolean,
    serialize<T extends Class_> (instance: T): Json,
    serialize<T extends Class_> (instance: T[]): Json[],
    serializeToString<T extends Class_> (instance: T | T[]): string,
    deserialize<T extends Class_> (obj: Json[], clazz: new () => T): T[],
    deserialize<T extends Class_> (obj: Json, clazz: new () => T): T,
    deserialize<T extends Class_> (obj: string, clazz: new () => T): T | T[],
    deserializeObject<T extends Class_> (obj: Json | string, clazz: new () => T): T,
    deserializeArray<T extends Class_> (obj: Json[] | string, clazz: new () => T): T[]
  };

  //converters
  const DateConverter: AbstractJsonConverter<string, Date>;
}


