import { Test, TestingModule } from '@nestjs/testing';
import { TachesController } from './taches.controller';
import { TachesService } from './taches.service';

describe('TachesController', () => {
  let controller: TachesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TachesController],
      providers: [TachesService],
    }).compile();

    controller = module.get<TachesController>(TachesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
