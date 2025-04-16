export interface JwtPayload {
  sub: string; // User ID
  jti: string; // Token ID
  deviceId: string; // Device ID
  iat?: number; // Issued at time
  exp?: number; // Expiration time
}
