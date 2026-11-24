import { Test, TestingModule } from '@nestjs/testing';
import { ServersController } from './servers.controller.js';
import { ServersService } from './servers.service.js';

describe('ServersController', () => {
  let controller: ServersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServersController],
      providers: [ServersService],
    }).compile();

    controller = module.get<ServersController>(ServersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
