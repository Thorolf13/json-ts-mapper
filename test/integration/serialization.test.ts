import { describe, it } from "mocha"
import { expect } from "chai";

import { JsonTsMapper, JsonObject, JsonProperty, Optional, NotNull, CustomConverter, AbstractJsonConverter, Context } from "../../src";


describe('[serialization]', () => {

  it('should deszerialize json', () => {
    @JsonObject
    class MyClass {

      @JsonProperty(String)
      _string = 's1';

      @JsonProperty(Number)
      _number = 12;

      @JsonProperty(Boolean, '_boolean')
      _boolean = true

      @JsonProperty([String], '_stringArray')
      _stringArray = ['s1', "s2"]

      @JsonProperty(String)
      @Optional
      _optional?: string;

      @JsonProperty(String)
      _null: null | string = null;

      @JsonProperty(String, '_notNull')
      @NotNull
      _notNull?: string = 's2'

      @JsonProperty(String, '_mapName')
      _toAnOtherName: string = 's3';
    }

    const instance = new MyClass();

    const json = JsonTsMapper.serialize(instance);

    expect(json).eql({
      _string: 's1',
      _number: 12,
      _boolean: true,
      _stringArray: ['s1', 's2'],
      _null: null,
      _notNull: 's2',
      _mapName: 's3',
    })
  })

  it(('should throw error wrong type'), () => {
    @JsonObject
    class MyClass {
      @JsonProperty(Number)
      _string = 's1'
    }

    expect(() => JsonTsMapper.serialize(new MyClass())).to.throw('type missmatch')
  })

  it(('should throw error @NotNull'), () => {
    @JsonObject
    class MyClass {
      @JsonProperty(String)
      @NotNull
      _notNull: null | string = null;
    }

    expect(() => JsonTsMapper.serialize(new MyClass())).to.throw('notNull')
  })

  it(('should throw error property missing'), () => {
    @JsonObject
    class MyClass {
      @JsonProperty(String)
      _string?: string
    }

    const json = {}

    expect(() => JsonTsMapper.serialize(new MyClass())).to.throw('missing')
  })

  it('should map arrays', () => {
    @JsonObject
    class MyClass {
      @JsonProperty([String])
      _string = ['s1', 's2']
    }
    const instances = [new MyClass(), new MyClass()]

    const json = JsonTsMapper.serialize(instances);
    expect(json).eql([{ _string: ['s1', 's2'] }, { _string: ['s1', 's2'] }])
  })

  it('should map nested classes', () => {

    @JsonObject
    class MyNestedClass {
      @JsonProperty(String)
      _string: string = 's1'
    }
    @JsonObject
    class MyClass {
      @JsonProperty(MyNestedClass)
      obj: MyNestedClass | null = null;
    }

    const instance = new MyClass();
    instance.obj = new MyNestedClass();

    const json = JsonTsMapper.serialize(instance);

    expect(json).eql({
      obj: {
        _string: 's1'
      }
    });
  })

  it(('should ignore unmaped props'), () => {
    @JsonObject
    class MyClass {
      @JsonProperty(String)
      _string: string = 's1'

      _number: number = 12;
    }

    const json = JsonTsMapper.serialize(new MyClass());

    expect(json).eql({ _string: 's1' });
  })


  it('should use converter (with context)', () => {

    class Converter extends AbstractJsonConverter<string, Date>{
      serialize(obj: Date, context?: Context): string {
        if (context === undefined || context.timezone === undefined) {
          throw new Error('context with timezone must be set')
        }

        const d = new Date(obj);
        d.setHours(d.getHours() + context.timezone);

        return d.toISOString();
      }
      deserialize(obj: string, context?: Context): Date {
        throw new Error('not implemented !');
      }

    }

    @JsonObject
    class MyClass {
      @CustomConverter(Converter)
      @JsonProperty(String)
      date: Date = new Date(Date.UTC(2010, 10, 23, 8, 0, 0, 0));
    }

    const json = JsonTsMapper.serialize(new MyClass(), { timezone: +2 });
    expect(json).eql({ date: '2010-11-23T10:00:00.000Z' });
  })
});
