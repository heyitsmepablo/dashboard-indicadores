import { Test, TestingModule } from '@nestjs/testing';
import { TipoDeUnidadeController } from './tipo-de-unidade.controller';

describe('TipoDeUnidadeController', () => {
  let controller: TipoDeUnidadeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoDeUnidadeController],
    }).compile();

    controller = module.get<TipoDeUnidadeController>(TipoDeUnidadeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
