import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import IAuth from './user.interface';

 const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuth => {
    const request = ctx.switchToHttp().getRequest();
    const authUser = request.authUser;
    const token = request.headers.jwt;
    return { authUser, token };
  },
);

export default Auth;
