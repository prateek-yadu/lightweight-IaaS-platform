import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async getUser(userId: any) {
    // connect to pool
    const pool = await this.databaseService.connectToPool();

    const user = await pool.query(
      'SELECT name, email FROM users WHERE id = $1',
      [userId],
    );

    if (user.rowCount == 0) {
      throw new NotFoundException('user not found');
    }

    return { user: user.rows[0] };
  }

  async createUser(createUserDto: CreateUserDto) {
    // connect to pool
    const pool = await this.databaseService.connectToPool();

    const user = await pool.query('SELECT email FROM users WHERE email = $1', [
      createUserDto.email,
    ]);

    // check user
    if (user.rowCount != 0) {
      throw new ConflictException('user already exists');
    }

    // hash password
    const saltRounds =
      (typeof process.env.PASSWORD_SALTROUNDS == 'string' &&
        parseInt(process.env.PASSWORD_SALTROUNDS)) ||
      10;

    const hash = bcrypt.hashSync(createUserDto.password, saltRounds);

    // create user
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [createUserDto.name, createUserDto.email, hash],
    );

    return { message: 'user created successfully!' };
  }
}
