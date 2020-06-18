import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  password: string;
}
