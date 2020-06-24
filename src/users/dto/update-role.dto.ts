import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends CreateRoleDto {
  @ApiProperty()
  @IsNumber()
  id: number;
}
