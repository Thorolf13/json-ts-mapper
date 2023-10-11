import 'reflect-metadata';
import { ConverterConstructor, ConverterInstance } from './json-converter';
import { setPropertyOptions } from './metadata';

export function JsonProperty (expectedType?: { new(): {} } | { new(): {} }[], jsonPropertyName?: string) {
  return function (target: any, classPropertyName: string) {
    if (expectedType === undefined) {
      if (Reflect.hasMetadata('design:type', target, classPropertyName)) {
        expectedType = Reflect.getMetadata('design:type', target, classPropertyName);
        if (expectedType === undefined) {
          throw new Error('JsonTsMapper : @JsonProperty : Type must be specified');
        }
        if (Array.isArray(expectedType)) {
          throw new Error('JsonTsMapper : @JsonProperty : type must be specified for array')
        }
      } else {
        throw new Error('JsonTsMapper : @JsonProperty : Type must be specified');
      }
    }

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
    setPropertyOptions(target, classPropertyName, options);
  }
}

export function Optional () {
  return function (target: any, classPropertyName: string) {
    setPropertyOptions(target, classPropertyName, { isOptional: true });
  }
}

export function NotNull () {
  return function (target: any, classPropertyName: string) {
    setPropertyOptions(target, classPropertyName, { notNull: true });
  }
}

export function Converter (customMapper: ConverterConstructor | ConverterInstance) {
  return function (target: any, classPropertyName: string) {
    setPropertyOptions(target, classPropertyName, { customMapper })
  }
}
