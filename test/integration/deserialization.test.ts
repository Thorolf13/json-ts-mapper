import { describe, it } from "mocha"
import { expect } from "chai";
import 'reflect-metadata';

import { JsonTsMapper, JsonProperty, Optional, NotNull, Converter, AbstractJsonConverter } from "../../src";


describe('[deserialization]', () => {

  it('should deszerialize json', () => {
    class MyClass {

      @JsonProperty(String)
      _string?: string;

      @JsonProperty(Number)
      _number?: number;

      @JsonProperty(Boolean, '_boolean')
      _boolean?: boolean;

      @JsonProperty([String], '_stringArray')
      _stringArray?: string[];

      @JsonProperty(String)
      @Optional()
      _optional?: string;

      @JsonProperty(String)
      _null?: string;

      @JsonProperty(String, '_notNull')
      @NotNull()
      _notNull?: string;

      @JsonProperty(String, '_mapName')
      _toAnOtherName?: string;
    }

    const json = {
      _string: 's1',
      _number: 1,
      _boolean: true,
      _stringArray: ['a', 'b'],
      _null: null,
      _notNull: 's2',
      _mapName: 's3',
    }

    const instance = JsonTsMapper.deserialize(json, MyClass);

    expect(instance).instanceOf(MyClass);
    expect(instance._string).equal('s1');
    expect(instance._number).equal(1);
    expect(instance._boolean).equal(true);
    expect(instance._stringArray).eql(['a', 'b']);
    expect(instance._optional).equal(undefined);
    expect(instance._boolean).equal(true);
    expect(instance._null).equal(null);
    expect(instance._notNull).equal('s2');
    expect(instance._toAnOtherName).equal('s3');
  })

  it(('should throw error wrong type'), () => {
    class MyClass {
      @JsonProperty(String)
      _string?: string
    }

    const json = {
      _string: 1
    }

    expect(() => JsonTsMapper.deserialize(json, MyClass)).to.throw('type missmatch')
  })

  it(('should throw error @NotNull'), () => {
    class MyClass {
      @JsonProperty(String)
      @NotNull()
      _notNull?: string
    }

    const json = {
      _notNull: null
    }

    expect(() => JsonTsMapper.deserialize(json, MyClass)).to.throw('notNull')
  })

  it(('should throw error property missing'), () => {
    class MyClass {
      @JsonProperty(String)
      _string?: string
    }

    const json = {}

    expect(() => JsonTsMapper.deserialize(json, MyClass)).to.throw('missing')
  })

  it('should map arrays', () => {
    class MyClass {
      @JsonProperty([String])
      _string?: string[]
    }

    const json = [
      { _string: ['1'] },
      { _string: ['1'] },
      { _string: ['2', '5'] }
    ]

    const instances = JsonTsMapper.deserialize(json, MyClass);
    expect(instances).instanceOf(Array)
    expect(instances).to.have.lengthOf(3);
    expect((instances as any[])[0]).instanceOf(MyClass);
    expect(instances[2]._string).eql(['2', '5'])
  })

  it('should map nested classes', () => {

    class MyNestedClass {
      @JsonProperty(String)
      _string?: string
    }

    class MyClass {
      @JsonProperty(MyNestedClass)
      obj?: MyNestedClass;
    }

    const json = {
      obj: {
        _string: '1'
      }
    }

    const instance = JsonTsMapper.deserialize(json, MyClass);

    expect(instance).instanceOf(MyClass);
    expect(instance.obj).instanceOf(MyNestedClass);
    expect(instance.obj?._string).equal('1');
  })

  it(('should ignore unmaped props'), () => {
    class MyClass {
      @JsonProperty(String)
      _string?: string

      _number?: number;
    }

    const json = {
      _string: '1',
      _number: 3
    }

    const instance = JsonTsMapper.deserialize(json, MyClass);

    expect(instance._number).equal(undefined);
  })

  it('should use converter', () => {

    class MyConverter extends AbstractJsonConverter<string, Date>{
      serialize (obj: Date): string {
        throw new Error('not implemented !');
      }
      deserialize (obj: string): Date {
        return new Date(Date.parse(obj));
      }

    }

    class MyClass {
      @Converter(MyConverter)
      @JsonProperty(String)
      date: Date | null = null;
    }

    const json = {
      date: '2010-11-23T10:00:00.000+0000'
    }

    const instance = JsonTsMapper.deserialize(json, MyClass);

    expect(instance).instanceOf(MyClass);
    expect(instance.date).instanceOf(Date);
    expect(instance.date).to.eql(new Date(Date.UTC(2010, 10, 23, 10, 0, 0, 0)));
  })
});
