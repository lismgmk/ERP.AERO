import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
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
import { Device } from './entities/device.entity';
import { SignInDto } from './dto/signin.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signUp(
    createUserDto: CreateUserDto,
    deviceInfo: { deviceId: string; deviceName: string; deviceType?: string }
  ) {
    try {
      const user = await this.usersService.create(createUserDto);

      // Create default device for new user
      const device = this.deviceRepository.create({
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        user,
      });
      await this.deviceRepository.save(device);

      return this.generateTokens(user, device);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error during user registration');
    }
  }

  async signIn(
    signInDto: SignInDto,
    deviceInfo: { deviceId: string; deviceName: string; deviceType?: string }
  ) {
    const { id, password } = signInDto;
    const user = await this.usersService.findByIdOrEmail(id);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find or create device
    let device = await this.deviceRepository.findOne({
      where: { deviceId: deviceInfo.deviceId, user: { id: user.id } },
    });

    if (!device) {
      device = this.deviceRepository.create({
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        user,
      });
      await this.deviceRepository.save(device);
    }

    return this.generateTokens(user, device);
  }

  async refreshToken(refreshToken: string, deviceId: string) {
    try {
      // Find the token in the database
      const tokenEntity = await this.tokenRepository.findOne({
        where: { refreshToken, device: { deviceId } },
        relations: ['user', 'device'],
      });

      if (!tokenEntity || tokenEntity.isRevoked) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if the token is expired
      if (new Date() > tokenEntity.expiresAt) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Delete the old token
      await this.tokenRepository.delete({ id: tokenEntity.id });

      // Generate new tokens
      return this.generateTokens(tokenEntity.user, tokenEntity.device);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(user: User, deviceId: string) {
    // Find tokens for specific device
    const tokens = await this.tokenRepository.find({
      where: {
        user: { id: user.id },
        device: { deviceId },
      },
    });

    // Remove found tokens
    if (tokens.length > 0) {
      await this.tokenRepository.remove(tokens);
    }

    return { message: 'Logout successful' };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const { sub, jti, deviceId } = payload;

    // Find the user
    const user = await this.usersService.findOne(sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Verify the token is not revoked
    const token = await this.tokenRepository.findOne({
      where: {
        id: jti,
        isRevoked: false,
        device: { deviceId },
      },
    });

    if (!token) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return user;
  }

  private async generateTokens(user: User, device: Device) {
    // Create token ID
    const tokenId = uuidv4();

    // Create JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      jti: tokenId,
      deviceId: device.deviceId,
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
      device,
    });

    await this.tokenRepository.save(token);

    return {
      accessToken,
      refreshToken,
    };
  }
}
