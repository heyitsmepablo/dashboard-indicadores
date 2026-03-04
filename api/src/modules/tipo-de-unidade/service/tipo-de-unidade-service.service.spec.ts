import { Test, TestingModule } from '@nestjs/testing';
import { TipoDeUnidadeService } from './tipo-de-unidade-service.service';

describe('TipoDeUnidadeService', () => {
  let service: TipoDeUnidadeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoDeUnidadeService],
    }).compile();

    service = module.get<TipoDeUnidadeService>(TipoDeUnidadeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
