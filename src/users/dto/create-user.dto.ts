import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-9]{10,15}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, {
    message: 'ID must be a valid email or phone number',
  })
  id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
