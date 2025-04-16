import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'nest-api-super-secret-key',
  expiresIn: '10m',
  refreshExpiresIn: '7d',
}));
