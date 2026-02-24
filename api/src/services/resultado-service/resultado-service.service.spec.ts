import { Test, TestingModule } from '@nestjs/testing';
import { ResultadoServiceService } from './resultado-service.service';

describe('ResultadoServiceService', () => {
  let service: ResultadoServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultadoServiceService],
    }).compile();

    service = module.get<ResultadoServiceService>(ResultadoServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
