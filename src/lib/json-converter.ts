export abstract class AbstractJsonConverter<JsonType extends string | number | boolean | { [key: string]: any }, TsType>{

  abstract serialize(obj: TsType, context?: Context): JsonType;
  abstract deserialize(obj: JsonType, context?: Context): TsType;
}

export type Context = { [name: string]: any };
