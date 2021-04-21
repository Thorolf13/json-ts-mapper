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
import { JsonTsMapperService, JsonObject, JsonProperty } from 'json-ts-mapper'

@JsonObject
class MyClass{

  @JsonProperty(String)
  myValue:string = 'default';

}

const mapper = new JsonTsMapperService()


// Assume that you get a json string or object from any source
const jsonString = '{ ... }';
const jsonObject = { ... };

const instance1 = mapper.deserialize(jsonString, MyClass);
const instance2 = mapper.deserialize(jsonObject, MyClass);

console.log(instance1); // print MyClass{ ... } instead of Object{ ... }
console.log(instance2); // print MyClass{ ... } instead of Object{ ... }
```

## Change from v1.x.x

* Fix some bugs
* Remove dependencies to angular

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
    "experimentalDecorators": true
    [...]
}
```

## Usage

### Class definition

* Classes need to be preceeded by `@JsonObject`
* Properties need to be preceeded by `@JsonProperty(JsonPropertyType, jsonPropertyName?)`
* Properties can be preceeded by
  * `@Optional`
  * `@NotNull`
  * `@CustomConverter(CustomConverterClass)` to add a spécial converter for this property

```ts
import { JsonObject, JsonProperty, Optional, CustomConverter, Any, NotNull} from 'json-ts-mapper';
import { DateConverter } from '...';


@JsonObject({
  overrideInitValues : true
})
export class User {
  @JsonProperty(Number)
  @NotNull // property cant be null or missing
  id:number;

  @JsonProperty(String)
  @Optional // property is optional
  libelle:string;

  @JsonProperty(Boolean, 'valid')
  isValid:boolean; // json and class properties cant have different names

  @JsonProperty([Number])
  values:number[];

  @JsonProperty(Any)
  anything:any;  

  // Assume that you have a class 'UserInfos' decorated with JsonObject
  @JsonProperty(UserInfos)
  infos:UserInfos;

  @JsonProperty(String)
  @CustomConverter(DateConverter) // a custom converter used to handle special mapping
  date:Date;
}
```

#### __JsonObject__ :

Declare an object that can be handle by json mapper
```ts
//without options
@JsonObject

//with options
@JsonObject({
  overrideInitValues : true
})

```
Mapping options :
> * __overrideInitValues__ :
>    * if false _(default)_ : if json property is undefined and class property initialized, keep initial value
>    * if true : override initialized value of property, even to set it to undefined


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

#### __CustomConverter__ :

Define a class that handle convertion between JSON and Ts property

### CustomConverter

```ts
import { Context, AbstractJsonConverter } from 'json-ts-mapper';

class DateConverter extends AbstractJsonConverter<string, Date>{

  serialize(obj: Date, context?: Context): string{
    // serialize object to string
  }
  deserialize(obj: string, context?: Context): Date{
    // deserialize date string to date object
  }
}
```

In some case, we need additional information to serialize/deserialize property.  
A context object can be passed when calling serialize or deserialize method of mapper service. This context is passed to custom converters.


```ts
import { JsonTsMapperService } from  'json-ts-mapper';

const jsonObject = { ... };

const mappingContext = {dateFormat:'yyyy-mm-dd', anotherProperty:['some','values']};

const user = this.mapper.deserialize(jsonObject, User, mappingContext);
```