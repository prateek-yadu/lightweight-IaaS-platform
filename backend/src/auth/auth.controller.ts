import { Body, Controller, Post, Session } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  createUserSchema,
  type CreateUserDto,
} from '../users/dto/create-user.dto.js';
import { UsersService } from '../users/users.service.js';
import { type LoginUserDto, loginUserSchema } from './dto/login-user.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  loginUser(
    @Body({ schema: loginUserSchema })
    loginUserDto: LoginUserDto,
    @Session() session: Record<string, any>,
  ) {
    return this.authService.loginUser(loginUserDto, session);
  }

  @Post('register')
  registerUser(
    @Body({ schema: createUserSchema }) createUserDto: CreateUserDto,
  ) {
    return this.userService.createUser(createUserDto);
  }

  @Post('logout')
  logoutUser(@Session() session: Record<string, any>) {
    return this.authService.logoutUser(session);
  }
}
