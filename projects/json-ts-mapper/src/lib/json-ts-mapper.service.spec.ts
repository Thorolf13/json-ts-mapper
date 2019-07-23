import { TestBed } from '@angular/core/testing';

import { JsonTsMapperService } from './json-ts-mapper.service';

describe('JsonTsMapperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JsonTsMapperService = TestBed.get(JsonTsMapperService);
    expect(service).toBeTruthy();
  });
});
