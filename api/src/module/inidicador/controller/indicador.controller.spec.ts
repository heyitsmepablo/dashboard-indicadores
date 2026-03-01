import { Test, TestingModule } from '@nestjs/testing';
import { IndicadorController } from './indicador.controller';

describe('IndicadorController', () => {
  let controller: IndicadorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndicadorController],
    }).compile();

    controller = module.get<IndicadorController>(IndicadorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
