import { IsNotEmpty, IsJSON } from 'class-validator';

export class VkCallbackQueryDto {
  @IsNotEmpty()
  code: string;

  @IsJSON()
  state: string;
}
