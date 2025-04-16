import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { File } from './entities/file.entity';
import { User } from '../users/entities/user.entity';
import { FileListDto } from './dto/file-list.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async uploadFile(file: Express.Multer.File, user: User): Promise<File> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileEntity = this.filesRepository.create({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
      size: file.size,
      user,
    });

    return this.filesRepository.save(fileEntity);
  }

  async getFilesList(fileListDto: FileListDto, user: User) {
    const { list_size = 10, page = 1 } = fileListDto;
    
    // Validate pagination parameters
    const take = Math.max(1, Math.min(100, list_size)); // Between 1 and 100
    const skip = (Math.max(1, page) - 1) * take;

    const [files, total] = await this.filesRepository.findAndCount({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      files,
      meta: {
        page,
        list_size: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getFileInfo(id: number, user: User): Promise<File> {
    const file = await this.filesRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async getFileForDownload(id: number, user: User): Promise<File> {
    const file = await this.getFileInfo(id, user);
    
    // Check if file exists on filesystem
    if (!fs.existsSync(file.path)) {
      throw new NotFoundException(`File ${file.originalName} not found on server`);
    }
    
    return file;
  }

  async deleteFile(id: number, user: User): Promise<{ message: string }> {
    const file = await this.getFileInfo(id, user);
    
    // Delete file from filesystem
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      throw new BadRequestException(`Error deleting file: ${error.message}`);
    }
    
    // Delete file from database
    await this.filesRepository.remove(file);
    
    return { message: 'File deleted successfully' };
  }

  async updateFile(id: number, file: Express.Multer.File, user: User): Promise<File> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    const existingFile = await this.getFileInfo(id, user);
    
    // Delete old file from filesystem
    try {
      if (fs.existsSync(existingFile.path)) {
        fs.unlinkSync(existingFile.path);
      }
    } catch (error) {
      throw new BadRequestException(`Error replacing file: ${error.message}`);
    }
    
    // Update file information
    existingFile.originalName = file.originalname;
    existingFile.filename = file.filename;
    existingFile.path = file.path;
    existingFile.mimetype = file.mimetype;
    existingFile.extension = path.extname(file.originalname).toLowerCase();
    existingFile.size = file.size;
    existingFile.updatedAt = new Date();
    
    return this.filesRepository.save(existingFile);
  }
}
