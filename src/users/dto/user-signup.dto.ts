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
  @Matches(/^(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}
