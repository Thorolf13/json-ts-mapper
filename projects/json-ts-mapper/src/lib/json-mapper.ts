export type Context = { [name: string]: any };

export abstract class JsonMapper<JsonType, TsType>{

  abstract serialize(obj: TsType, context?: Context): JsonType;
  abstract deserialize(obj: JsonType, context?: Context): TsType;
}
