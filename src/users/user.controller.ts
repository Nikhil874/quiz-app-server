import {
  BadRequestException,
  Bind,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import  Auth, {IAuth } from 'src/decors/user.decoration';
import { PageSchema } from 'src/dto/quiz.schema';
import { userSchema } from 'src/dto/user.schema';
import  AuthGuard  from 'src/guards/auth.guard';

import { UserService } from './user.service';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(AuthGuard)
  @Get('/quizes')
  getAllUserQuizes(@Auth() auth: IAuth, @Query() { page }: { page: number }) {
    const { value, error } = PageSchema.validate(page);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return this.userService.getAllUserQuizes(auth, value);
  }
  @UseGuards(AuthGuard)
  @Get('/quizes/:id')
  getUserQuizesById(
    @Param('id', ParseIntPipe) id: number,
    @Auth() auth: IAuth,
  ) {
    return this.userService.getQuizById({ id, auth });
  }
  @Post('/register')
  createUser(
    @Body()
    {
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    },
  ) {
    const { value, error } = userSchema.validate({ name, email, password });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return this.userService.createUser(value);
  }
  @Post('/login')
  loginUser(@Body() { email, password }: { email: string; password: string }) {
    let name = 'aaaaaa';
    const { value, error } = userSchema.validate({ name, email, password });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return this.userService.loginUser({
      email: value.email,
      password: value.password,
    });
  }
}
