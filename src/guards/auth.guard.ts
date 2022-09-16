import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import * as Jwt from 'jsonwebtoken';

import { Reflector } from '@nestjs/core';

import 'dotenv/config';
import { User } from 'src/users/user.entity';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const token = request.headers.jwt;

      const decoded = Jwt.verify(token, 'secret');

      const userId = decoded.data;

      const user = await User.findOneBy({ id: userId });

      if (user) {
        request.authUser = user;
      }

      return true;
    } catch (e) {
      throw new UnauthorizedException('forbidden');
    }
  }
}
