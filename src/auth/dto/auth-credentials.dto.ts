import { IsString, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(3)
  email: string;

  @IsString()
  @MinLength(2)
  password: string;
}
