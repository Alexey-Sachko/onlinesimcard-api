import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignupDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  // @Matches(/[^a-zA-Z]/, {
  //   message: 'password too weak',
  // })
  password: string;
}
