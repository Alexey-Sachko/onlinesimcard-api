import {
  Controller,
  Body,
  ValidationPipe,
  Post,
  Get,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserSignupDto } from './dto/user-signup.dto';
import { UsersService } from './users.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionsGuard } from '../auth/permissions.guard';
import { HasPermissions } from '../auth/permissions.decorator';
import { Permissions } from './permissions.enum';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/signup')
  async signup(@Body(ValidationPipe) userSignupDto: UserSignupDto) {
    return this.usersService.createUser(userSignupDto);
  }

  @UseGuards(AuthGuard())
  @Post('/testemail')
  async testSendEmail(@Body('to') to: string, @Body('token') token: string) {
    return this.usersService.testSendEmail(to, token);
  }

  @Get('/verify/:token')
  async verifyUser(@Param('token') token: string) {
    return this.usersService.verifyUser(token);
  }

  @UseGuards(AuthGuard())
  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @HasPermissions(Permissions.RolesWrite)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Post('roles')
  async getRoles(@Body() createRoleDto: CreateRoleDto) {
    return this.usersService.createRole(createRoleDto);
  }

  @HasPermissions(Permissions.RolesWrite)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Post('roles')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.usersService.createRole(createRoleDto);
  }

  @UseGuards(AuthGuard())
  @Get('role')
  async getUserRole(@GetUser() user: User) {
    return this.usersService.getUserRole(user);
  }
}
