# JsonTsMapper

![Test](https://img.shields.io/badge/Tests-17/17-green.svg)
![Coverage](https://img.shields.io/badge/Coverage-85%25-green.svg)
![Dependencies](https://img.shields.io/badge/Dependencies-1-green.svg)
![Typescript](https://img.shields.io/badge/Made%20with-Typescript-blue.svg)
![LGPL3](https://img.shields.io/badge/Licence-LGPL%20V3-yellow.svg)

__JsonTsMapper__ is a small package that maps JSON objects to an instance of a TypeScript class

* Minimalist : only one dependency
* Create instances of classes instead of raw object
* Format validation
* Allow custom mapping
* Easy to use
* Inspired by Java way
  
Exemple :
```ts
import { JsonTsMapper, JsonProperty } from 'json-ts-mapper'
class MyClass{

  @JsonProperty(String)
  myValue:string;
}

// Assume that you get a json string or object from any source
const jsonString = '{ ... }';
const jsonObject = { ... };

const instance1 = JsonTsMapper.deserialize(jsonString, MyClass);
const instance2 = JsonTsMapper.deserialize(jsonObject, MyClass);

console.log(instance1); // print MyClass{ ... } instead of Object{ ... }
console.log(instance2); // print MyClass{ ... } instead of Object{ ... }
```

## Changelog

[See changelog](./CHANGELOG.md)

## install

```sh
npm install json-ts-mapper --save
```

## Configuration

The package makes use of TypeScript decorators. If not done already, please activate them in your __tsconfig.json__ under compilerOptions as follows:
```
{
  "compilerOptions": {
    [...]
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    [...]
}
```

## Usage

### serialize / deserialize
```ts
import { JsonTsMapper } from 'json-ts-mapper'

// serialize can take an instance or an array of it
JsonTsMapper.serialize(instance) // => {...}
JsonTsMapper.serialize([instance1, instance2]) // => [{...},{...}]

//serializeToString is same to serialize but stringified
JsonTsMapper.serializeToString(instance); // => "{...}"

//serializeAs an object against a class definition
JsonTsMapper.serializeAs(instance, MyClass); // => {...}
JsonTsMapper.serializeAs([instance1, instance2], MyClass); // => [{...},{...}]

//serializeAsToString is same to serializeAs but stringified
JsonTsMapper.serializeAsToString(instance, MyClass); // => "{...}"

// deserialize can take json string or object, single instance or array
JsonTsMapper.deserialize("{...}", MyClass); // =>MyClass{...}
JsonTsMapper.deserialize({...}, MyClass); // =>MyClass{...}
JsonTsMapper.deserialize("[{...},{...}]", MyClass); // => [ MyClass{...}, MyClass{...} ]
JsonTsMapper.deserialize([{...},{...}], MyClass); // => [ MyClass{...}, MyClass{...} ]

JsonTsMapper.deserializeObject(json, MyClass); //=> deserialize unique object
JsonTsMapper.deserializeArray(json, MyClass); //=> deserialize an array

JsonTsMapper.isMapped(target) //=> return true if target is mapped, target can be a class or an instance
```

### Class definition

* Properties need to be preceeded by `@JsonProperty(JsonPropertyType?, jsonPropertyName?)`
* Properties can be preceeded by
  * `@Optional`
  * `@NotNull`
  * `@Converter(ConverterClass)` to add a special converter for this property

```ts
import { JsonProperty, Optional, Converter, Any, NotNull} from 'json-ts-mapper';
import { DateConverter } from '...';

export class User {
  @JsonProperty(Number)
  @NotNull() // property cant be null or missing
  id:number;

  @JsonProperty(String)
  @Optional() // property is optional
  libelle:string;

  @JsonProperty(Boolean, 'valid')
  isValid:boolean; // json and class properties can have different names

  @JsonProperty([Number])
  values:number[];

  @JsonProperty(Any)
  anything:any;  

  // Assume that you have a class 'UserInfos' decorated with @JsonProperty
  @JsonProperty(UserInfos)
  infos:UserInfos;

  @JsonProperty(String)
  @Converter(DateConverter) // a custom converter used to handle special mapping
  date:Date;
}
```
#### __JsonProperty__ :

Define name and type of expected JSON Property.

| Expected type | TypeScript type |
| ------------- | --------------- |
| String        | string          |
| Number        | number          |
| Boolean       | boolean         |
| User          | User            |
| Any           | any             |
| [String]      | string[]        |
| [Number]      | number[]        |
| [Boolean]     | boolean[]       |
| [User]        | User[]          |
| [Any]         | any[]           |

#### __Optional__ :

Allow property to be omitted or equal to `undefined`  
_Cant be used together with `NotNull`_

#### __NotNull__ :

Disallow property to be equal to `null`  
_Cant be used together with `Optional`_

#### __Converter__ :

Define a class that handle convertion between JSON and Ts property

### Converter

A converter can be a class, an instance of class or an object, it must be satisfying the AbstractJsonConverter interface

```ts
import { AbstractJsonConverter } from 'json-ts-mapper';

class DateConverter extends AbstractJsonConverter<string, Date>{

  serialize(obj: Date): string{
    // serialize object to string
  }
  deserialize(obj: string): Date{
    // deserialize date string to date object
  }
}

const converter = {
   serialize(obj: Date): string{
    // serialize object to string
  },
  deserialize(obj: string): Date{
    // deserialize date string to date object
  }
}
```