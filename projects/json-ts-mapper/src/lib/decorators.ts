import 'reflect-metadata';
import { AbstractJsonConverter } from './json-converter';
import { MappingOptions, ClassMappingOptions } from './mapping-options';

export const JSON_OBJECT = 'jtsm_json_object';
export const CUSTOM_CONVERTER = 'jtsm_custom_converter';
export const MAPPING_OPTIONS = 'jtsm_mapping_options';
export const MAPPING_OPTIONS_OPTIONAL = 'jtsm_mapping_optional';
export const MAPPING_OPTIONS_NOTNULL = 'jtsm_mapping_not_null';
export const MAPPING_OPTIONS_MAPPER = 'jtsm_mapping_mapper';

export function JsonConverter(target: any) {
  Reflect.defineMetadata(CUSTOM_CONVERTER, '__json_converter__', target);
}

export function JsonObject(target: any) {
  Reflect.defineMetadata(JSON_OBJECT, '__json_object__', target);

  Reflect.getMetadataKeys(target.prototype)
    .filter(key => {
      return typeof key === 'string' && key.startsWith(MAPPING_OPTIONS);
    })
    .forEach(key => {
      Reflect.defineMetadata(key, Reflect.getMetadata(key, target.prototype), target);
    });

}

export function JsonObjectOptions(options: ClassMappingOptions) {
  return function(target: any) {
    Reflect.defineMetadata(JSON_OBJECT, '__json_object__', target);

    Reflect.getMetadataKeys(target.prototype)
      .filter(key => {
        return typeof key === 'string' && key.startsWith(MAPPING_OPTIONS);
      })
      .forEach((key: string) => {
        const metadata = Reflect.getMetadata(key, target.prototype)
        if (key.startsWith(MAPPING_OPTIONS_MAPPER) && options.overrideInitValues !== undefined) {
          (metadata as MappingOptions).overrideInitValue = options.overrideInitValues;
        }
        Reflect.defineMetadata(key, metadata, target);
      });

  }
}

export function JsonProperty(jsonPropertyName: string, expectedType: { new(): {} } | { new(): {} }[]) {
  return function(target: any, classPropertyName: string) {
    let isArray = false;

    if (Array.isArray(expectedType)) {
      if (expectedType.length !== 1) {
        throw new Error('JsonTsMapper : @JsonProperty : Type array must have length = 1')
      }

      isArray = true;
      expectedType = expectedType[0];
    }


    jsonPropertyName = jsonPropertyName === undefined ? classPropertyName : jsonPropertyName;

    const options = new MappingOptions(target.constructor.name, classPropertyName, jsonPropertyName, isArray, expectedType);
    if (Reflect.hasMetadata(`${MAPPING_OPTIONS_OPTIONAL}-${classPropertyName}`, target)) {
      options.isOptional = true; // Reflect.getMetadata(`${MAPPING_OPTIONS_OPTIONAL}-${classPropertyName}`, target);
    }
    if (Reflect.hasMetadata(`${MAPPING_OPTIONS_NOTNULL}-${classPropertyName}`, target)) {
      options.notNull = true; // Reflect.getMetadata(`${MAPPING_OPTIONS_NOTNULL}-${classPropertyName}`, target);
      options.isOptional = false;
    }
    if (Reflect.hasMetadata(`${MAPPING_OPTIONS_MAPPER}-${classPropertyName}`, target)) {
      options.customMapper = Reflect.getMetadata(`${MAPPING_OPTIONS_MAPPER}-${classPropertyName}`, target);
    }
    Reflect.defineMetadata(`${MAPPING_OPTIONS}-${classPropertyName}`, options, target);
  }
}

export function Optional(target: any, classPropertyName: string) {
  if (Reflect.hasMetadata(`${MAPPING_OPTIONS_NOTNULL}-${classPropertyName}`, target)) {
    throw new Error('"Optional" and "NotNull" annotations are not compatible');
  }
  Reflect.defineMetadata(`${MAPPING_OPTIONS_OPTIONAL}-${classPropertyName}`, true, target);
}

export function NotNull(target: any, classPropertyName: string) {
  if (Reflect.hasMetadata(`${MAPPING_OPTIONS_OPTIONAL}-${classPropertyName}`, target)) {
    throw new Error('"@Optional" and "@NotNull" annotations are not compatible');
  }
  Reflect.defineMetadata(`${MAPPING_OPTIONS_NOTNULL}-${classPropertyName}`, true, target);
}

export function CustomConverter<T extends AbstractJsonConverter<any, any>>(customMapper: new () => T) {
  return function(target: any, classPropertyName: string) {
    Reflect.defineMetadata(`${MAPPING_OPTIONS_MAPPER}-${classPropertyName}`, customMapper, target);
  }
}
