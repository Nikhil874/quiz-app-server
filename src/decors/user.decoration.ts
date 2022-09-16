import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/user.entity';

export interface IAuth {
  authUser: User;
  token: string;
}
export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuth => {
    const request = ctx.switchToHttp().getRequest();
    const authUser = request.authUser;
    const token = request.headers.jwt;
    return { authUser, token };
  },
);
