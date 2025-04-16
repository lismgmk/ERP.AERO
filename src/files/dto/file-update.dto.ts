import { IsNotEmpty } from 'class-validator';

export class FileUpdateDto {
  @IsNotEmpty()
  file: Express.Multer.File;
}
