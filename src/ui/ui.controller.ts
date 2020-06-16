import { Controller, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(AuthGuard())
@Controller('ui')
export class UiController {
  @Get()
  async getUi(@GetUser() user: User) {
    return user.role.permissions;
  }
}
