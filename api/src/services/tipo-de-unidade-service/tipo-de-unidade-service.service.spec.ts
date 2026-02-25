import { Test, TestingModule } from '@nestjs/testing';
import { TipoDeUnidadeServiceService } from './tipo-de-unidade-service.service';

describe('TipoDeUnidadeServiceService', () => {
  let service: TipoDeUnidadeServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoDeUnidadeServiceService],
    }).compile();

    service = module.get<TipoDeUnidadeServiceService>(TipoDeUnidadeServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
