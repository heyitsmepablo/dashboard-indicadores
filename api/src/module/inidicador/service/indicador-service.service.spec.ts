import { Test, TestingModule } from '@nestjs/testing';
import { IndicadorService } from './indicador-service.service';

describe('IndicadorService', () => {
  let service: IndicadorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndicadorService],
    }).compile();

    service = module.get<IndicadorService>(IndicadorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
