import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByIdOrEmail(idOrEmail: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: [{ id: idOrEmail }, { email: idOrEmail }],
    });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { id, password } = createUserDto;
    
    // Check if user exists
    const existingUser = await this.findByIdOrEmail(id);
    if (existingUser) {
      throw new ConflictException('User with this ID or email already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Determine if ID is email or phone
    const isEmail = id.includes('@');
    
    // Create user
    const user = this.usersRepository.create({
      id,
      password: hashedPassword,
      email: isEmail ? id : null,
      phone: !isEmail ? id : null,
    });
    
    return this.usersRepository.save(user);
  }
}
