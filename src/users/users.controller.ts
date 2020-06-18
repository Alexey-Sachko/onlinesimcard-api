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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger/tags';
import { UserSignupDto } from './dto/user-signup.dto';
import { UsersService } from './users.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionsGuard } from '../auth/permissions.guard';
import { HasPermissions } from '../auth/permissions.decorator';
import { Permissions } from './permissions.enum';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './user.entity';

@ApiTags(SwaggerTags.Users)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @Post('/signup')
  async signup(@Body(ValidationPipe) userSignupDto: UserSignupDto) {
    return this.usersService.createUser(userSignupDto);
  }

  @ApiOperation({ summary: 'Протестировать отправку email' })
  @ApiBearerAuth()
  @HasPermissions(Permissions.WriteEmail)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Post('/testemail')
  async testSendEmail(@Body('to') to: string, @Body('token') token: string) {
    return this.usersService.testSendEmail(to, token);
  }

  @ApiOperation({ summary: 'Подтвердить учетную запись' })
  @Get('/verify/:token')
  async verifyUser(@Param('token') token: string) {
    return this.usersService.verifyUser(token);
  }

  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiBearerAuth()
  @HasPermissions(Permissions.WriteUsers)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Получить список ролей' })
  @ApiBearerAuth()
  @HasPermissions(Permissions.RolesRead)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Get('roles')
  async getRoles() {
    return this.usersService.getRoles();
  }

  @ApiOperation({ summary: 'Создать роль' })
  @ApiBearerAuth()
  @HasPermissions(Permissions.RolesWrite)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Post('roles')
  async createRole(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
    return this.usersService.createRole(createRoleDto);
  }

  @ApiOperation({ summary: 'Получить свою роль' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('role')
  async getUserRole(@GetUser() user: User) {
    return this.usersService.getUserRole(user);
  }
}
