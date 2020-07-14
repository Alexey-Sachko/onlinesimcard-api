import {
  Controller,
  Body,
  ValidationPipe,
  Post,
  Get,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger/tags';
import { UsersService } from './users.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Permissions } from './permissions.enum';
import { User } from './user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetUser } from './get-user.decorator';
import { HasPermissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';

@ApiTags(SwaggerTags.Users)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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

  @ApiOperation({ summary: 'Обновить роль' })
  @ApiBearerAuth()
  @HasPermissions(Permissions.RolesWrite)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Put('roles')
  async updateRole(@Body(ValidationPipe) updateRoleDto: UpdateRoleDto) {
    return this.usersService.updateRole(updateRoleDto);
  }

  @ApiOperation({ summary: 'Получить свою роль' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('role')
  async getUserRole(@GetUser() user: User) {
    return this.usersService.getUserRole(user);
  }
}
