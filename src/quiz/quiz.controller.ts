import {
  BadRequestException,
  Bind,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import Auth, {IAuth } from 'src/decors/user.decoration';
import { answerSchema } from 'src/dto/answer.schema';
import { PageSchema, quizSchema } from 'src/dto/quiz.schema';
import  AuthGuard  from 'src/guards/auth.guard';
import { IQuestion, Quiz } from './quiz.entity';

import { IAnswer, QuizService } from './quiz.service';
@Controller('/quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('/')
  getAllPublishedQuizes(@Query() { page }: { page: number }) {
    const { value, error } = PageSchema.validate(page);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return this.quizService.getAllPublishedQuizes(value);
  }

  @Get('/published/:permaLink')
  getPublishedQuiz(@Param('permaLink') permaLink: string) {
    return this.quizService.getPublishedQuiz({ id: permaLink });
  }

  @UseGuards(AuthGuard)
  @Post()
  createQuiz(
    @Body() { title, questions }: { title: string; questions: IQuestion[] },
    @Auth() auth: IAuth,
  ) {
    let { value, error } = quizSchema.validate({ title, questions });
    if (error) {
      throw new BadRequestException(error.message);
    }

    return this.quizService.createQuiz({
      title: value?.title,
      questions: value?.questions,
      auth,
    });
  }

  @Post('/published/:permalink')
  takeQuiz(
    @Param('permalink') permalink: string,
    @Body() { answers }: { answers: IAnswer[] },
  ) {
    let { value, error } = answerSchema.validate(answers);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return this.quizService.verifyTakeQuiz({ id: permalink, answers: answers });
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  updateQuiz(
    @Body() { title, questions }: { title: string; questions: IQuestion[] },
    @Auth() auth: IAuth,
    @Param('id', ParseIntPipe) id: number,
    @Query() { publish }: { publish: boolean },
  ) {
    if (!publish) {
      var { value, error } = quizSchema.validate({ title, questions });
      if (error) {
        throw new BadRequestException(error.message);
      }
    }

    return this.quizService.updateQuiz({
      id,
      title: value?.title,
      questions: value?.questions,
      auth,
      publish,
    });
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  deteletQuiz(@Param('id', ParseIntPipe) id: number, @Auth() auth: IAuth) {
    return this.quizService.deleteQuiz({ id, auth });
  }
}
