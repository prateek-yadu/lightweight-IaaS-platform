import { Test, TestingModule } from '@nestjs/testing';
import { RegionsController } from './regions.controller.js';
import { RegionsService } from './regions.service.js';

describe('RegionsController', () => {
  let controller: RegionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegionsController],
      providers: [RegionsService],
    }).compile();

    controller = module.get<RegionsController>(RegionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
