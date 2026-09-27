import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service.js';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('test database connection', async () => {
    // Creates db pool
    await service.onModuleInit();

    // store pool ref
    const pool = await service.connectToPool();

    const status = (await pool.query('SELECT 1 AS status')).rows[0].status;

    // destroy pool
    await service.onModuleDestroy();
    expect(status).toBe(1);
  });
});
