import { JsonTsMapperService } from './lib/json-ts-mapper.service';
import { JsonProperty, Optional, NotNull, Converter } from './lib/decorators';
import { AbstractJsonConverter } from './lib/json-converter';
import { Any } from './lib/any';

const JsonTsMapper = new JsonTsMapperService();

export {
  JsonTsMapper,

  JsonProperty,
  Optional,
  NotNull,
  Converter,

  Any,

  AbstractJsonConverter
};
