import { Test, TestingModule } from '@nestjs/testing';
import { UnidadeController } from './unidade.controller';

describe('UnidadeController', () => {
  let controller: UnidadeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnidadeController],
    }).compile();

    controller = module.get<UnidadeController>(UnidadeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
