import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';

export class UserSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  // @Matches(/[^a-zA-Z]/, {
  //   message: 'password too weak',
  // })
  password: string;
}
