import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@smartcana/types';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayload | undefined,
    ctx: ExecutionContext,
  ): JwtPayload | string | string[] | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    return data ? user?.[data] : user;
  },
);
