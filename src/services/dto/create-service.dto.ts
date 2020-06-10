import { IsString, MinLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  @MinLength(1)
  name: string;
}
