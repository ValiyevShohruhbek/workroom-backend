import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @IsString()
  password: string;

  @IsString()
  session_token: string;

  @IsString()
  @IsPhoneNumber('UZ')
  phone_number: string;
}
