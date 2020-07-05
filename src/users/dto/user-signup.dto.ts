import { IsString, MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UserSignupDto {
  @ApiProperty()
  @IsEmail()
  @Field()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  // @Matches(/[^a-zA-Z]/, {
  //   message: 'password too weak',
  // })
  @Field()
  password: string;
}
