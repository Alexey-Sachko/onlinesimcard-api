import { IsString, MinLength } from 'class-validator';

export class UserSigninDto {
  @IsString()
  @MinLength(5)
  email: string;

  @IsString()
  @MinLength(2)
  password: string;
}
