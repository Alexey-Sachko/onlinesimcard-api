import { IsNotEmpty } from 'class-validator';

export class VkCakkbackQueryDto {
  @IsNotEmpty()
  code: string;
}
