import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { Permissions } from '../permissions.enum';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ enum: Permissions, isArray: true })
  @IsString({ each: true })
  permissions: Permissions[];
}
