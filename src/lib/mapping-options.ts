import { AbstractJsonConverter, ConverterConstructor, ConverterInstance } from './json-converter';
import { Any } from './any'

type Nullable<T> = T | null;



export class MappingOptions {
  constructor (
    public className: string,
    public classPropertyName: string,
    public jsonPropertyName: string,
    public isArray: boolean = false,
    public expectedJsonType: new () => {} = Any,
    public isOptional: boolean = false,
    public customMapper: Nullable<ConverterConstructor | ConverterInstance> = null,
    public notNull = false,
    public overrideInitValue = false
  ) { }
}

export interface ClassMappingOptions {
  overrideInitValues?: boolean;
}

export function isInstanceOfClassMappingOptions (obj: any): obj is ClassMappingOptions {
  return 'overrideInitValues' in obj;
}
