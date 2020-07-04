import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AuthCredentialsDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @Field()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @Field()
  password: string;
}
