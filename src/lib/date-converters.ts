import { AbstractJsonConverter, Context } from './json-converter'

export class DateTimeConverter extends AbstractJsonConverter<string, Date>{
  serialize(obj: Date, context?: Context): string {
    return obj.toISOString();
  }
  deserialize(obj: string, context?: Context): Date {
    return new Date(Date.parse(obj));
  }
}

export class DateConverter extends AbstractJsonConverter<string, Date>{
  serialize(obj: Date, context?: Context): string {
    return obj.toISOString().substring(0, 10);
  }
  deserialize(obj: string, context?: Context): Date {
    const date = new Date(Date.parse(obj));
    date.setUTCHours(0, 0, 0, 0);

    return date;
  }
}
