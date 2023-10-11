export type ConverterConstructor = new () => AbstractJsonConverter<any, any>;
export type ConverterInstance = AbstractJsonConverter<any, any>;

export abstract class AbstractJsonConverter<JsonType extends string | number | boolean | { [key: string]: any }, TsType>{

  abstract serialize (obj: TsType): JsonType;
  abstract deserialize (obj: JsonType): TsType;
}
