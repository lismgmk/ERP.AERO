import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Token } from './entities/token.entity';
import { SignInDto } from './dto/signin.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error during user registration');
    }
  }

  async signIn(signInDto: SignInDto) {
    const { id, password } = signInDto;
    const user = await this.usersService.findByIdOrEmail(id);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      // Find the token in the database
      const tokenEntity = await this.tokenRepository.findOne({
        where: { refreshToken },
        relations: ['user'],
      });

      if (!tokenEntity || tokenEntity.isRevoked) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if the token is expired
      if (new Date() > tokenEntity.expiresAt) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new tokens
      return this.generateTokens(tokenEntity.user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(user: User) {
    // Revoke all tokens for the user
    await this.tokenRepository.update(
      { user: { id: user.id }, isRevoked: false },
      { isRevoked: true }
    );

    return { message: 'Logout successful' };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const { sub, jti } = payload;
    
    // Find the user
    const user = await this.usersService.findOne(sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    // Verify the token is not revoked
    const token = await this.tokenRepository.findOne({ 
      where: { id: jti, isRevoked: false } 
    });
    
    if (!token) {
      throw new UnauthorizedException('Token has been revoked');
    }
    
    return user;
  }

  private async generateTokens(user: User) {
    // Create token ID
    const tokenId = uuidv4();
    
    // Create JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      jti: tokenId,
    };
    
    // Sign JWT token
    const accessToken = this.jwtService.sign(payload);
    
    // Create refresh token
    const refreshToken = uuidv4();
    
    // Set refresh token expiration date
    const expiresIn = this.configService.get('jwt.refreshExpiresIn');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    // Save refresh token to database
    const token = this.tokenRepository.create({
      id: tokenId,
      refreshToken,
      expiresAt,
      user,
    });
    
    await this.tokenRepository.save(token);
    
    return {
      accessToken,
      refreshToken,
    };
  }
}
