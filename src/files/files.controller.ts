import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { FileListDto } from './dto/file-list.dto';
import { FileUpdateDto } from './dto/file-update.dto';

@Controller('file')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.filesService.uploadFile(file, user);
  }

  @Get('list')
  async getFilesList(
    @Query() fileListDto: FileListDto,
    @GetUser() user: User,
  ) {
    return this.filesService.getFilesList(fileListDto, user);
  }

  @Delete('delete/:id')
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.filesService.deleteFile(id, user);
  }

  @Get(':id')
  async getFileInfo(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.filesService.getFileInfo(id, user);
  }

  @Get('download/:id')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const file = await this.filesService.getFileForDownload(id, user);
    return res.download(file.path, file.originalName);
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.filesService.updateFile(id, file, user);
  }
}
