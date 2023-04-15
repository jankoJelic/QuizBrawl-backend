import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '../constants/authConstants';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { extractTokenFromHeader } from '../util/extractTokenFromHeader';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const { email, id, refreshToken, isAdmin } =
        await this.jwtService.verifyAsync(token, {
          secret: this.configService.get(JWT_SECRET),
        });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['email'] = email;
      request['userId'] = id;
      request['refreshToken'] = refreshToken;
      request['isAdmin'] = isAdmin;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
