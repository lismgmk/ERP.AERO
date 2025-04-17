import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './get-user.decorator';
import { User } from '../users/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetDeviceInfo } from './decorators/device-info.decorator';
import { DeviceInfo } from './interfaces/device-info.interface';
import { ApiDeviceHeaders } from '../common/decorators/api-device-headers.decorator';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @ApiOperation({ summary: 'User sign in' })
  @ApiResponse({ status: 200, description: 'User successfully signed in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiDeviceHeaders()
  async signIn(
    @Body() signInDto: SignInDto,
    @GetDeviceInfo() deviceInfo: DeviceInfo
  ) {
    if (!deviceInfo.deviceId || !deviceInfo.deviceName) {
      throw new UnauthorizedException('Device information is required');
    }

    return this.authService.signIn(signInDto, deviceInfo);
  }

  @Post('signin/new_token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiDeviceHeaders()
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetDeviceInfo() deviceInfo: DeviceInfo
  ) {
    if (!deviceInfo.deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    return this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      deviceInfo.deviceId
    );
  }

  @Post('signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiDeviceHeaders()
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @GetDeviceInfo() deviceInfo: DeviceInfo
  ) {
    if (!deviceInfo.deviceId || !deviceInfo.deviceName) {
      throw new UnauthorizedException('Device information is required');
    }

    return this.authService.signUp(createUserDto, deviceInfo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiDeviceHeaders()
  async logout(@GetUser() user: User, @GetDeviceInfo() deviceInfo: DeviceInfo) {
    if (!deviceInfo.deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    return this.authService.logout(user, deviceInfo.deviceId);
  }
}
