import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private poolRef: Pool;
  async onModuleInit() {
    try {
      this.poolRef = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        maxLifetimeSeconds: 60,
      });

      await this.poolRef.query('SELECT 1');
      console.info('Connected to DB!');
    } catch (error) {
      console.error('DB connection failed!');
    }
  }

  async onModuleDestroy() {
    await this.poolRef?.end();
    console.log('Closed DB connection!');
  }

  async connectToPool() {
    return this.poolRef;
  }
}
