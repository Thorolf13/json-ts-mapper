export type Context = { [name: string]: any };

export abstract class JsonMapper<JsonType extends string | number | boolean, TsType>{

  abstract serialize(obj: TsType, context?: Context): JsonType;
  abstract deserialize(obj: JsonType, context?: Context): TsType;
}
