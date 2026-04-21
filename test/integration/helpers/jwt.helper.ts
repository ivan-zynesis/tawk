import { JwtService } from '@nestjs/jwt';

const JWT_SECRET = 'test-secret';

export { JWT_SECRET };

export function signTestToken(jwtService: JwtService, userId: string): string {
  return jwtService.sign({ sub: userId }, { secret: JWT_SECRET });
}
