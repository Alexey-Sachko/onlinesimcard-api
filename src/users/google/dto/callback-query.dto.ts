import { IsString } from 'class-validator';

export class GoogleAuthCallbackQueryDto {
  @IsString()
  code: string;
}
