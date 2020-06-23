import { IsString, MinLength, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermTokenDto {
  @ApiProperty({ example: 'My personal token' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
