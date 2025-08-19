import { IsPhoneNumber, IsString } from 'class-validator';

export class CheckProfileDto {
  @IsString()
  @IsPhoneNumber('UZ')
  phone_number: string;

  @IsString()
  session_token: string;

  @IsString()
  user_id: string;
}
