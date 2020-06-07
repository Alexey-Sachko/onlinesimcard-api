import {
  Controller,
  Body,
  ValidationPipe,
  Post,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { UserSignupDto } from './dto/user-signup.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/signup')
  async signup(@Body(ValidationPipe) userSignupDto: UserSignupDto) {
    return this.usersService.createUser(userSignupDto);
  }

  @Post('/testemail')
  async testSendEmail(@Body('to') to: string, @Body('token') token: string) {
    return this.usersService.testSendEmail(to, token);
  }

  @Get('/verify/:token')
  async verifyUser(@Param('token') token: string) {
    return this.usersService.verifyUser(token);
  }

  @Delete('/:id') // TODO: add permition only for admin
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
