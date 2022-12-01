import 'reflect-metadata';
import { ConverterConstructor, ConverterInstance } from './json-converter';
import { MappingOptions, ClassMappingOptions, isInstanceOfClassMappingOptions } from './mapping-options';

export const JSON_OBJECT = 'jtsm_json_object';
export const CUSTOM_CONVERTER = 'jtsm_custom_converter';
export const MAPPING_OPTIONS = 'jtsm_mapping_options';

export function JsonConverter (target: any) {
  Reflect.defineMetadata(CUSTOM_CONVERTER, '__json_converter__', target);
}


export function JsonObject (option: ClassMappingOptions): (target: any) => void;
export function JsonObject (target: any): void;
export function JsonObject (arg1: any) {
  if (isInstanceOfClassMappingOptions(arg1)) {
    return _JsonObject(arg1)
  } else {
    return _JsonObject({})(arg1);
  }

}

function _JsonObject (options: ClassMappingOptions) {
  return function (target: any) {
    Reflect.defineMetadata(JSON_OBJECT, '__json_object__', target);

    Reflect.getMetadataKeys(target.prototype)
      .filter(key => {
        return typeof key === 'string' && key.startsWith(MAPPING_OPTIONS);
      })
      .forEach((key: string) => {
        const metadata: MappingOptions = Reflect.getMetadata(key, target.prototype);
        if (metadata.className === '') {
          throw new Error('Mapping option decoration @Optional, @NotNull, @CustomConverter cannot be used without @JsonProperty decoration')
        }
        if (options.overrideInitValues !== undefined) {
          metadata.overrideInitValue = options.overrideInitValues;
        }
        Reflect.defineMetadata(key, metadata, target);
      });

  }
}

export function JsonProperty (expectedType?: { new(): {} } | { new(): {} }[], jsonPropertyName?: string) {
  return function (target: any, classPropertyName: string) {
    let isArray = false;

    if (Array.isArray(expectedType)) {
      if (expectedType.length !== 1) {
        throw new Error('JsonTsMapper : @JsonProperty : Type array must have length = 1')
      }

      isArray = true;
      expectedType = expectedType[0];
    }


    jsonPropertyName = jsonPropertyName === undefined ? classPropertyName : jsonPropertyName;

    const options = {
      className: target.constructor.name,
      classPropertyName,
      jsonPropertyName,
      isArray,
      expectedJsonType: expectedType
    };
    _addPropertyOptions(target, classPropertyName, options);
  }
}

export function Optional (target: any, classPropertyName: string) {
  _addPropertyOptions(target, classPropertyName, { isOptional: true });
}

export function NotNull (target: any, classPropertyName: string) {
  _addPropertyOptions(target, classPropertyName, { notNull: true });
}

export function CustomConverter (customMapper: ConverterConstructor | ConverterInstance) {
  return function (target: any, classPropertyName: string) {
    _addPropertyOptions(target, classPropertyName, { customMapper })
  }
}

function _addPropertyOptions (target: any, propertyName: string, options: Partial<MappingOptions>) {
  let _options: MappingOptions = Reflect.getMetadata(`${MAPPING_OPTIONS}-${propertyName}`, target);

  if (_options === undefined) {
    _options = new MappingOptions('', '', '');
  }

  Object.assign(_options, options);

  if (_options.isOptional === true && _options.notNull === true) {
    throw new Error('"@Optional" and "@NotNull" annotations are not compatible');
  }

  Reflect.defineMetadata(`${MAPPING_OPTIONS}-${propertyName}`, _options, target);

}
