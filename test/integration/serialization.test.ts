import { describe, it } from "mocha"
import { expect } from "chai";

import { JsonTsMapper, JsonProperty, Optional, NotNull, Converter, AbstractJsonConverter } from "../../src";


describe('[serialization]', () => {

  it('should serialize a class\'s instance', () => {
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
      @Optional()
      _optional?: string;

      @JsonProperty(String)
      _null: null | string = null;

      @JsonProperty(String, '_notNull')
      @NotNull()
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
    class MyClass {
      @JsonProperty(Number)
      _string = 's1'
    }

    expect(() => JsonTsMapper.serialize(new MyClass())).to.throw('type missmatch')
  })

  it(('should throw error @NotNull'), () => {
    class MyClass {
      @JsonProperty(String)
      @NotNull()
      _notNull: null | string = null;
    }

    expect(() => JsonTsMapper.serialize(new MyClass())).to.throw('notNull')
  })

  it(('should throw error property missing'), () => {
    class MyClass {
      @JsonProperty(String)
      _string?: string
    }

    const json = {}

    expect(() => JsonTsMapper.serialize(new MyClass())).to.throw('missing')
  })

  it('should map arrays', () => {
    class MyClass {
      @JsonProperty([String])
      _string: string[] = ['s1', 's2']
    }
    const instances = [new MyClass(), new MyClass()]

    const json = JsonTsMapper.serialize(instances);
    expect(json).eql([{ _string: ['s1', 's2'] }, { _string: ['s1', 's2'] }])
  })

  it('should map nested classes', () => {

    class MyNestedClass {
      @JsonProperty(String)
      _string: string = 's1'
    }

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

    class MyClass {
      @JsonProperty(String)
      _string: string = 's1'

      _number: number = 12;
    }

    const json = JsonTsMapper.serialize(new MyClass());

    expect(json).eql({ _string: 's1' });
  })


  it('should use converter (with context)', () => {

    class MyConverter extends AbstractJsonConverter<string, Date>{
      serialize (obj: Date): string {
        return obj.toISOString();
      }
      deserialize (obj: string): Date {
        throw new Error('not implemented !');
      }

    }

    class MyClass {
      @Converter(MyConverter)
      @JsonProperty(String)
      date: Date = new Date(Date.UTC(2010, 10, 23, 8, 0, 0, 0));
    }

    const json = JsonTsMapper.serialize(new MyClass());
    expect(json).eql({ date: '2010-11-23T08:00:00.000Z' });
  })

  it('should use converter object', () => {

    const myConverter = {
      serialize (obj: string): string {
        return obj.toUpperCase();
      },
      deserialize (obj: string): Date {
        throw new Error('not implemented !');
      }

    }

    class MyClass {
      @Converter(myConverter)
      @JsonProperty(String)
      str: string = 'test'
    }

    const json = JsonTsMapper.serialize(new MyClass());
    expect(json).eql({ str: 'TEST' });
  })

  it('should serialize an object as a mapped class', () => {
    class MyClass {
      @JsonProperty(String)
      _string: string = '';

      @JsonProperty(Number)
      _number: number = 0;
    }

    const obj = {
      _string: 's1',
      _number: 12
    }

    const json = JsonTsMapper.serializeAs(obj, MyClass);
    expect(json).eql({ _string: 's1', _number: 12 });

    const str = JsonTsMapper.serializeAsToString(obj, MyClass);
    expect(str).eql('{"_string":"s1","_number":12}')

  })
});
