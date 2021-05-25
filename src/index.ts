import { JsonTsMapperService } from './lib/json-ts-mapper.service';
import { JsonObject, JsonConverter, JsonProperty, Optional, NotNull, CustomConverter } from './lib/decorators';
import { Context, AbstractJsonConverter } from './lib/json-converter';
import { DateTimeConverter, DateConverter } from './lib/date-converters'
import { Any } from './lib/any';

const JsonTsMapper = new JsonTsMapperService();

export {
  JsonTsMapper,

  JsonObject,
  JsonConverter,
  JsonProperty,
  Optional,
  NotNull,
  CustomConverter,

  Any,

  Context,
  AbstractJsonConverter,

  DateTimeConverter,
  DateConverter,
};
