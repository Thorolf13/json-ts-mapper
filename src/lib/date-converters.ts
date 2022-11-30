import { AbstractJsonConverter, Context } from './json-converter'

export class DateTimeConverter extends AbstractJsonConverter<string, Date>{
  serialize (obj: Date, context?: Context): string {
    return obj.toISOString();
  }
  deserialize (obj: string, context?: Context): Date {
    return new Date(Date.parse(obj));
  }
}
