import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { QuizModule } from './quiz/quiz.module';
import { UserModule } from './users/user.module';
import  config  from 'ormcofig';

@Module({
  imports: [TypeOrmModule.forRoot(config), UserModule, QuizModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
