import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { UserId } from '../common/decorators/user-id.decorator.js';

@UseGuards(AuthGuard)
@Controller('profile/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getUser(@UserId() userId: string) {
    return this.usersService.getUser(userId);
  }

  @Delete('me')
  deleteUser() {
    return 'will be implemented soon.';
  }
}
