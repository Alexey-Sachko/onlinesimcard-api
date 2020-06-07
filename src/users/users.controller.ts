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
}
