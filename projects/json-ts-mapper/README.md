# JsonTsMapper

In Angular applications, everyone consumes JSON API's from an external source. Type checking and object mapping is only possible in TypeScript, but not in the JavaScript runtime. As the API may change at any point, it is important for larger projects to verify the consumed data.

__JsonTsMapper__ is a small package containing a helper class that maps JSON objects to an instance of a TypeScript class. After compiling to JavaScript, the result will still be an instance of this class. One big advantage of this approach is, that you can also use methods of this class.

__JsonTsMapper__ require some decorators in mapped class and a simple call :
```ts
import { JsonTsMapperService } from  '@thorolf/json-ts-mapper';

class AngularComponentOrService{
  constructor(private mapper : JsonTsMapperService)
  {}

  getData(){
    // Assume that you have a class 'MyClass' defined with required decorators
    // Assume that you get a json string or object from any source

    const jsonString = '{ ... }';
    const jsonObject = { ... };

    const instance1 = this.mapper.deserialize(jsonString, MyClass);
    const instance2 = this.mapper.deserialize(jsonObject, MyClass);

    console.log(instance1); // print MyClass{ ... } instead of Object{ ... }
    console.log(instance2); // print MyClass{ ... } instead of Object{ ... }
  }
}
```

## Requireements

### install

```sh
npm install @thorolf/json-ts-mapper --save
```

### Configuration

Our package makes use of TypeScript decorators. If not done already, please activate them in your __tsconfig.json__ under compilerOptions as follows:
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

### Class definition

In order to use the __JsonTsMapper__ package, all you need to do is write decorators and import the package. The following things need to be done if you would like to map JSON to existing classes:

* Classes need to be preceeded by `@JsonObject`
* Properties need to be preceeded by `@JsonProperty(jsonPropertyName, JsonPropertyType)`
* Properties can be preceeded by
  * `@Optional`
  * `@CustomConverter(CustomConverterClass)` to add a spécial converter for this property

```ts
import { JsonObject, JsonProperty, Optional, CustomConverter, Any, NotNull} from '@thorolf/json-ts-mapper';
import { DateConverter } from '...';

@JsonObject
export class User {
  @JsonProperty('id', Number)
  @NotNull // property cant be null or missing
  id:number;

  @JsonProperty('libelle', String)
  @Optional // property is optional
  libelle:string;

  @JsonProperty('valid', Boolean)
  isValid:boolean; // json ans class properties cant have different names

  @JsonProperty('values', [Number])
  values:number[];

  @JsonProperty('anything', Any)
  anything:any;  

  // Assume that you have a class 'UserInfos' decorated with JsonObject
  @JsonProperty('infos', UserInfos)
  infos:UserInfos;

  @JsonProperty('date', String)
  @CustomConverter(DateConverter) // a custom converter used to handle special mapping
  date:Date;
}
```

* __JsonProperty__ :

Define name and type of expected JSON Property.

|Expected type|TypeScript type|
|-|-|
|String|string|
|Number|number|
|Boolean|boolean|
|User|User|
|Any|any|
|[String]|string[]|
|[Number]|number[]|
|[Boolean]|boolean[]|
|[User]|User[]|
|[Any]|any[]|

* __Optional__ :

Allow property to be omitted or equal to `undefined`  
_Cant be used together with `NotNull`_

* __NotNull__ :

Disallow property to be equal to `null`  
_Cant be used together with `Optional`_

* __CustomConverter__ :

Define a class that handle convertion between JSON and Ts properties

### CustomConverter

```ts
import { Context, JsonMapper } from  '@thorolf/json-ts-mapper';

class DateConverter extends JsonMapper<string, Date>{

  serialize(obj: Date, context?: Context): string{
    // serialize object to string
  }
  deserialize(obj: string, context?: Context): Date{
    // deserialize date string to date object
  }
}
```

In some case, we need additional information to serialize/deserialize properties.  
A context object can be passed when calling serialize or deserialize method of mapper service. This context is passed to custom converters.


```ts
import { JsonTsMapperService, Context} from  '@thorolf/json-ts-mapper';

class AngularComponentOrService{
  constructor(private mapper : JsonTsMapperService)
  {}

  getData(){
    const jsonObject = { ... };

    const mappingContext:Context = {dateFormat:'yyyy-mm-dd', anotherProperty:['some','values']};

    const user = this.mapper.deserialize(jsonObject, User, mappingContext);
  }
}
```
