import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService) {}

  async loginUser(loginUserDto: LoginUserDto, session: Record<string, any>) {
    // connect to pool
    const pool = await this.databaseService.connectToPool();

    const user = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [loginUserDto.email],
    );

    // check if user exists
    if (user.rows.length <= 0) {
      throw new UnauthorizedException('invailed credentials');
    }

    // verify password
    const isCorrectPasswd = bcrypt.compareSync(
      loginUserDto.password,
      user.rows[0].password,
    );

    if (!isCorrectPasswd) {
      throw new UnauthorizedException('invailed credentials');
    }

    // create session
    session.userId = user.rows[0].id;

    return { message: 'User logged in successfully!' };
  }

  async logoutUser(session: Record<string, any>) {

    if (!session.userId){
      throw new NotAcceptableException('You are not logged in')
    }

    // destroy user session
    await session.destroy();

    return { message: 'user logged out successfully' };
  }
}
