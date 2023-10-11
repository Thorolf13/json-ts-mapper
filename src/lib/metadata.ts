import { MappingOptions } from "./mapping-options";

const METADATA_PREFIX = 'jtsm:';
export const METADATA_KEY_PROPERTY_OPTIONS = METADATA_PREFIX + 'options';
export const METADATA_KEY_PROPERTY_LIST = METADATA_PREFIX + 'properties';

export function setPropertyOptions (target: any, propertyName: string, options: Partial<MappingOptions>) {
  const mappedfields = Reflect.getMetadata(METADATA_KEY_PROPERTY_LIST, target.constructor) || [];
  mappedfields.push(propertyName);
  Reflect.defineMetadata(METADATA_KEY_PROPERTY_LIST, mappedfields, target.constructor);

  let _options: MappingOptions = Reflect.getMetadata(METADATA_KEY_PROPERTY_OPTIONS, target.constructor, propertyName);

  if (_options === undefined) {
    _options = new MappingOptions('', '', '');
  }

  Object.assign(_options, options);

  if (_options.isOptional === true && _options.notNull === true) {
    throw new Error('"@Optional" and "@NotNull" annotations are not compatible');
  }

  Reflect.defineMetadata(METADATA_KEY_PROPERTY_OPTIONS, _options, target.constructor, propertyName);

}

export function getPropertyOptions (target: any, propertyName: string): MappingOptions {
  const constructor = target.constructor.name === 'Function' ? target : target.constructor;
  return Reflect.getMetadata(METADATA_KEY_PROPERTY_OPTIONS, constructor, propertyName);
}

export function getMappedProperties (target: any): string[] {
  const constructor = target.constructor.name === 'Function' ? target : target.constructor;
  return Reflect.getMetadata(METADATA_KEY_PROPERTY_LIST, constructor) || [];
}

export function isMapped (target: any): boolean {
  const constructor = target.constructor.name === 'Function' ? target : target.constructor;
  return Reflect.hasMetadata(METADATA_KEY_PROPERTY_LIST, constructor);
}
