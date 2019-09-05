import { AbstractJsonConverter } from './json-converter';

export class MappingOptions {
  constructor(
    public className: string,
    public classPropertyName: string,
    public jsonPropertyName: string,
    public isArray: boolean = false,
    public expectedJsonType: new () => {} = null,
    public isOptional: boolean = false,
    public customMapper: new () => AbstractJsonConverter<any, any> = null,
    public notNull = false,
    public overrideInitValue = false
  ) { }
}

export interface ClassMappingOptions {
  overrideInitValues: boolean;
}
