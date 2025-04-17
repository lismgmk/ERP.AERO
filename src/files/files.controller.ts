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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Files')
@Controller('file')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File successfully uploaded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User
  ) {
    return this.filesService.uploadFile(file, user);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get list of files' })
  @ApiResponse({
    status: 200,
    description: 'List of files retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFilesList(@Query() fileListDto: FileListDto, @GetUser() user: User) {
    return this.filesService.getFilesList(fileListDto, user);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ) {
    return this.filesService.deleteFile(id, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file information' })
  @ApiResponse({
    status: 200,
    description: 'File information retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileInfo(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ) {
    return this.filesService.getFileInfo(id, user);
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Res() res: Response
  ) {
    const file = await this.filesService.getFileForDownload(id, user);
    return res.download(file.path, file.originalName);
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update a file' })
  @ApiResponse({ status: 200, description: 'File successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updateFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User
  ) {
    return this.filesService.updateFile(id, file, user);
  }
}
