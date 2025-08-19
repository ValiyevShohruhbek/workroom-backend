import { IsNumber, IsString } from 'class-validator';

export class CheckStepDto {
  @IsString()
  user_id: string;

  @IsNumber()
  step: number;
}
