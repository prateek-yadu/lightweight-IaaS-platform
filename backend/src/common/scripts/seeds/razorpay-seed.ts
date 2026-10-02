// RazorPay Seeder

import 'dotenv/config';
import { Pool } from 'pg';
import Razorpay from 'razorpay';
import { Plan } from '../../types/plan.types.js';

(async () => {
  try {
    // init razorpay
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // create pool
    const pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      maxLifetimeSeconds: 60,
    });

    // fetch plans from db
    const dbPlans: Plan[] = (
      await pool.query(
        'SELECT id, price, specs, type, validity_days, razorpay_id FROM plans',
      )
    ).rows;

    if (dbPlans.length <= 0) {
      throw new Error('No plan found in DB to upload to payment gateway!');
    }

    // create new plan in razorpay
    dbPlans.map(async (plan) => {
      const createPlan = await instance.plans.create({
        item: {
          name: plan.id,
          amount: plan.price * 100,
          currency: 'INR',
          description: `${plan.specs.vCPU} vCPU, ${plan.specs.memory} memory, ${plan.specs.storage} storage, ${plan.specs.dataTransfer} data transfer`,
        },
        interval: plan.validity_days,
        period: 'daily',
      });

      await pool.query('UPDATE plans SET razorpay_id = $1 WHERE id = $2', [
        createPlan.id,
        plan.id,
      ]);
    });

    console.log('seeding successfull!');
  } catch (error) {
    if (error instanceof Error) {
      // TypeScript now knows 'error' is an Error object
      console.error(error.message);
    } else {
      // Handles cases where something else was thrown (e.g., throw "string")
      console.error('An unexpected error occurred:', String(error));
    }
    console.log('seeding failed!');
  }
})();
