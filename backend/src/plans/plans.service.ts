import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class PlansService {
  constructor(private readonly databaseService: DatabaseService) {}
  async getPlans() {
    // connect to pool
    const pool = await this.databaseService.connectToPool();

    const plans = await pool.query(
      'SELECT id, price, specs, type, validity_days FROM plans',
    );

    if (plans.rowCount == 0) {
      throw new NotFoundException('No plan found.');
    }

    return { plans: plans.rows };
  }
}
