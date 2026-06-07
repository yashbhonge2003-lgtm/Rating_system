import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(20)
  @MaxLength(60)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message:
      'Password must include at least one uppercase letter and one special character',
  })
  password: string;

  @IsString()
  @MaxLength(400)
  address: string;
}
