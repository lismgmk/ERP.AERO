export interface JwtPayload {
  sub: string;   // User ID
  jti: string;   // Token ID
  iat?: number;  // Issued at time
  exp?: number;  // Expiration time
}
