import { Test, TestingModule } from '@nestjs/testing';
import { SuperintendenciaController } from './superintendencia.controller';

describe('SuperintendenciaController', () => {
  let controller: SuperintendenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperintendenciaController],
    }).compile();

    controller = module.get<SuperintendenciaController>(SuperintendenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
