import { Injectable } from '@angular/core';
// import { JsonMapper } from './json-mapper';
// import { find, remove } from 'lodash';
import 'reflect-metadata';
import { JSON_OBJECT, MAPPING_OPTIONS } from './decorators';
import { MappingOptions } from './mapping-options';
import { Context } from './json-mapper';
import { Any } from './any';


@Injectable({
  providedIn: 'root'
})
export class JsonTsMapperService {

  /**
   * Serialize objct to 'json object'
   * @param  obj object or array to serialize
   * @return    json object
   */
  serialize<T>(instance: T | T[], context?: Context): any {
    if (Array.isArray(instance)) {
      return instance.map(item => this.serialize_loopProperties(item, context));
    } else {
      return this.serialize_loopProperties(instance, context);
    }
  }

  /**
   * Serialize objct to json string
   * @param  obj object or array to serialize
   * @return    json string
   */
  serializeToString<T>(instance: T | T[], context?: Context): string {
    return JSON.stringify(this.serialize(instance, context));
  }

  /**
   * Deserialize an instance or array of {T}
   * @param obj object, array or json string to deserialize
   * @param clazz class to map object
   * @return instance or array of {T}
   */
  deserialize<T>(obj: object | object[] | string, clazz: new () => T, context?: Context): T | T[] {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
    }

    if (Array.isArray(obj)) {
      return this.deserializeArray(obj, clazz, context);
    } else {
      return this.deserializeObject(obj, clazz, context);
    }
  }

  /**
   * Deserialize {T}
   * @param obj object or json string to deserialize
   * @param clazz class to map object
   * @return instance of {T}
   */
  deserializeObject<T>(obj: object | string, clazz: new () => T, context?: Context): T {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
    }
    obj = obj as object;

    return this.deserialize_loopProperties(obj, clazz, context);
  }

  /**
   * Deserialize array of {T}
   * @param obj array or json string to deserialize
   * @param clazz class to map objects
   * @return T[]
   */
  deserializeArray<T>(obj: object[] | string, clazz: new () => T, context?: Context): T[] {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
    }
    const list = obj as object[];

    return list.map(item => this.deserializeObject(item, clazz, context));
  }

  private deserialize_loopProperties<T>(obj: object | string, clazz: new () => T, context?: Context): T {
    if (Reflect.hasMetadata(JSON_OBJECT, clazz)) {
      let instance = new clazz();

      const mappingOptionsKeys = Reflect.getMetadataKeys(clazz)
        .filter(key => {
          return typeof key === 'string' && key.startsWith(MAPPING_OPTIONS);
        });

      mappingOptionsKeys.forEach(key => {
        const options: MappingOptions = Reflect.getMetadata(key, clazz);
        if (options.isArray) {
          instance[options.classPropertyName] = this.deserializePropertyArray(obj[options.jsonPropertyName], options, context);
        } else {
          instance[options.classPropertyName] = this.deserializeProperty(obj[options.jsonPropertyName], options, context);
        }
      });

      return instance;
    } else {
      throw new Error(`JsonTsMapper | class : '${clazz.name}' | Trying to deserialize an object wihout @JsonObject annotation`)
    }
  }

  private deserializePropertyArray(jsonValues: any[], options: MappingOptions, context?: Context): any[] {
    if (jsonValues === undefined || jsonValues === null) {
      if (options.isOptional === false && jsonValues === undefined) {
        throw new Error(`JsonTsMapper | class : '${options.className}' | deserialize : json property ${options.jsonPropertyName} is missing and not optional`)
      } else if (options.notNull === true && jsonValues === null) {
        throw new Error(`JsonTsMapper | class : '${options.className}' | deserialize : json property ${options.jsonPropertyName} is null and set as 'notNull'`)
      } else {
        return jsonValues;
      }
    }

    if (!this.checkType(jsonValues, options.expectedJsonType, true)) {
      throw new Error(`JsonTsMapper | class : '${options.className}' | serialize : type missmatch : expected type : Array, received type : ${typeof jsonValues}`);
    }

    return jsonValues.map(jsonValue => this.deserializeProperty(jsonValue, options, context));
  }

  private deserializeProperty(jsonValue: any, options: MappingOptions, context?: Context): any {
    if (jsonValue === undefined || jsonValue === null) {
      if (options.isOptional === false && jsonValue === undefined) {
        throw new Error(`JsonTsMapper | class : '${options.className}' | deserialize : json property ${options.jsonPropertyName} is missing and not optional`)
      } else if (options.notNull === true && jsonValue === null) {
        throw new Error(`JsonTsMapper | class : '${options.className}' | deserialize : json property ${options.jsonPropertyName} is null and set as 'notNull'`)
      } else {
        return jsonValue;
      }
    }

    if (!this.checkType(jsonValue, options.expectedJsonType, false)) {
      throw new Error(`JsonTsMapper | class : '${options.className}' | deserialize : type missmatch : expected type : ${options.expectedJsonType.name}, received type : ${typeof jsonValue}`);
    }

    if (options.customMapper) {
      const mapper = new options.customMapper();
      return mapper.deserialize(jsonValue, context);
    } else if (Reflect.hasMetadata(JSON_OBJECT, options.expectedJsonType)) {
      return this.deserialize(jsonValue, options.expectedJsonType, context);
    } else {
      return jsonValue;
    }
  }

  private serialize_loopProperties<T>(instance: T, context?: Context): {} {
    if (Reflect.hasMetadata(JSON_OBJECT, instance.constructor)) {
      let json = {};

      const mappingOptionsKeys = Reflect.getMetadataKeys(instance.constructor)
        .filter(key => {
          return typeof key === 'string' && key.startsWith(MAPPING_OPTIONS);
        });

      mappingOptionsKeys.forEach(key => {
        const options: MappingOptions = Reflect.getMetadata(key, instance.constructor);
        if (options.isArray) {
          json[options.jsonPropertyName] = this.serializePropertyArray(instance[options.classPropertyName], options, context);
        } else {
          json[options.jsonPropertyName] = this.serializeProperty(instance[options.classPropertyName], options, context);
        }
      });

      for (let key in json) {
        if (json[key] === undefined) {
          delete json[key];
        }
      }

      return json;
    } else {
      throw new Error(`JsonTsMapper : Trying to serialize an object wihout @JsonObject annotation`);
    }
  }

  private serializePropertyArray(values: any[], options: MappingOptions, context?: Context): any[] {
    if (values === null || values === undefined) {
      if (options.isOptional === false && values === undefined) {
        throw new Error(`JsonTsMapper | class : '${options.className}' | serialize : class property ${options.classPropertyName} is missing and not optional`);
      } else if (options.notNull === true && values === null) {
        throw new Error(`JsonTsMapper | class : '${options.className}' | serialize : class property ${options.classPropertyName} is null and set as 'notNull'`);
      } else {
        return values;
      }
    }

    if (!Array.isArray(values)) {
      throw new Error(`JsonTsMapper | class : '${options.className}' | serialize : type missmatch : expected type : Array, serialized type : ${typeof values}`);
    }

    return values.map((value: any) => this.serializeProperty(value, options, context));
  }

  private serializeProperty(value: any, options: MappingOptions, context?: Context): any {
    let jsonValue: any;

    if (value === undefined || value === null) {
      jsonValue = value;
    } else {
      if (options.customMapper) {
        const mapper = new options.customMapper();
        jsonValue = mapper.serialize(value, context);
      } else if (Reflect.hasMetadata(JSON_OBJECT, options.expectedJsonType)) {
        jsonValue = this.serialize(value, context);
      } else {
        jsonValue = value;
      }
    }

    if (jsonValue === null || jsonValue === undefined) {
      if (options.isOptional === false && jsonValue === undefined) {
        throw new Error(`JsonTsMapper | class : '${options.className}' | serialize : class property ${options.classPropertyName} is missing and not optional`)
      } else if (options.notNull === true && jsonValue === null) {
        throw new Error(`JsonTsMapper | class : '${options.className}' | serialize : class property ${options.classPropertyName} is null and set as 'notNull'`)
      } else {
        return jsonValue;
      }
    }

    if (!this.checkType(jsonValue, options.expectedJsonType, false)) {
      throw new Error(`JsonTsMapper | class : '${options.className}' | serialize : type missmatch : expected type : ${options.expectedJsonType.name}, serialized type : ${typeof jsonValue}`);
    }


    return jsonValue;
  }

  checkType(jsonValue: any, expectedJsonType: new () => {} = Any, isArray = false): boolean {
    if (isArray) {
      if (Array.isArray(jsonValue)) {
        if (jsonValue.length) {
          jsonValue = jsonValue[0]
        } else {
          return true;
        }
      } else {
        return false;
      }
    }

    switch (expectedJsonType) {
      case Any:
        return true;
      case String:
        return typeof jsonValue === 'string'
      case Number:
        return typeof jsonValue === 'number';
      case Boolean:
        return typeof jsonValue === 'boolean';
      default:
        return typeof jsonValue === 'object';
    }
  }
}
