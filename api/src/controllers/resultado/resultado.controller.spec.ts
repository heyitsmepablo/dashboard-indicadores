import { Test, TestingModule } from '@nestjs/testing';
import { ResultadoController } from './resultado.controller';

describe('ResultadoController', () => {
  let controller: ResultadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultadoController],
    }).compile();

    controller = module.get<ResultadoController>(ResultadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
