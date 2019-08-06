import { JsonMapper } from './json-mapper';

export class MappingOptions {
  constructor(
    public className: string,
    public classPropertyName: string,
    public jsonPropertyName: string,
    public isArray: boolean = false,
    public expectedJsonType: new () => {} = null,
    public isOptional: boolean = false,
    public customMapper: new () => JsonMapper<any, any> = null,
    public notNull = false
  ) { }
}
