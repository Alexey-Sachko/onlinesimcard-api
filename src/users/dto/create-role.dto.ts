import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsEnum } from 'class-validator';
import { Permissions } from '../permissions.enum';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    enum: Permissions,
    isArray: true,
    example: Object.values(Permissions),
  })
  @IsEnum(Permissions, { each: true })
  permissions: Permissions[];
}
