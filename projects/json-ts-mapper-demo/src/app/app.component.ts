import { Component } from '@angular/core';
import { JsonTsMapperService, JsonObject, JsonProperty, Optional, JsonConverter, JsonMapper, Context, CustomConverter, NotNull } from 'json-ts-mapper';

@JsonConverter
class Converter extends JsonMapper<object>{
  serialize(obj: any, context?: Context): any {
    console.log('serialize context', context);
    return obj ? obj.id : undefined;
  }
  deserialize(obj: any, context?: Context): object {
    console.log('deserialize context', context);
    return context.context_key.filter(i => i.id == obj)[0];
    // return (obj as string).toUpperCase();
  }
  requiredContextKeys(): { serialize?: string[], deserialize?: string[] } | void {
    return { deserialize: ['context_key'] };
  }


}

@JsonObject
class Test {

  @JsonProperty('id', String)
  @NotNull
  id: string;

  @JsonProperty('id2', String)
  id2: string;

  @JsonProperty('prop', String)
  @CustomConverter(Converter)
  @Optional
  value: any;

  @JsonProperty('list', [String])
  @Optional
  list: string;

  @JsonProperty('tt', Test)
  @Optional
  test: Test;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'json-ts-mapper-demo';

  constructor(private mapper: JsonTsMapperService) {

    const jsontest = { id: '1', id2: null, prop: 'Test1', tt: { id: '2', id2: '32', prop: 'Test2', list: ['aa', 'bb', 'jj'] } };
    const test = this.mapper.deserialize(jsontest, Test, {
      context_key: [
        { id: 'Test1', var: 'plop' },
        { id: 'Test2', var: 'plopi' },
      ]
    });
    const serializedTest = this.mapper.serialize(test);

    console.log([jsontest, test, serializedTest]);

  }
}
