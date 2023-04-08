import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractTokenFromHeader } from '../util/extractTokenFromHeader';

export type RefreshToken = {
  refreshToken: string;
  payload: { id: string; email: string };
};

export const GetRefreshToken = createParamDecorator(
  (_: undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request?.refreshToken;
  },
);
