import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './get-user.decorator';
import { User } from '../users/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signIn(
    @Body() signInDto: SignInDto,
    @Headers('x-device-id') deviceId: string,
    @Headers('x-device-name') deviceName: string,
    @Headers('x-device-type') deviceType?: string
  ) {
    if (!deviceId || !deviceName) {
      throw new UnauthorizedException('Device information is required');
    }

    return this.authService.signIn(signInDto, {
      deviceId,
      deviceName,
      deviceType,
    });
  }

  @Post('signin/new_token')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Headers('x-device-id') deviceId: string
  ) {
    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    return this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      deviceId
    );
  }

  @Post('signup')
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Headers('x-device-id') deviceId: string,
    @Headers('x-device-name') deviceName: string,
    @Headers('x-device-type') deviceType?: string
  ) {
    if (!deviceId || !deviceName) {
      throw new UnauthorizedException('Device information is required');
    }

    return this.authService.signUp(createUserDto, {
      deviceId,
      deviceName,
      deviceType,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(
    @GetUser() user: User,
    @Headers('x-device-id') deviceId: string
  ) {
    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    return this.authService.logout(user, deviceId);
  }
}
