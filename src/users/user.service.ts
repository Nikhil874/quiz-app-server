import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { IAuth } from 'src/decors/user.decoration';
import { Quiz } from 'src/quiz/quiz.entity';

import { User } from './user.entity';
@Injectable()
export class UserService {
  async createUser({ email, password, name }): Promise<any> {
    const checkUser = await User.findOne({ where: { email } });
    if (checkUser) {
      throw new ConflictException('User Already exists');
    }
    var hash = bcrypt.hashSync(password, 8);

    const user = User.create({
      email,
      password: hash,
      name,
    });

    const userCreated = User.save(user);
    return { message: 'user created success' };
  }
  async loginUser({ email, password }) {
    const user = await User.findOne({ where: { email } });

    if (user) {
      const comapre = bcrypt.compareSync(password, user.password);
      if (comapre) {
        let userId = user.id;

        const token = jwt.sign(
          {
            data: userId,
          },
          'secret',
          { expiresIn: '10h' },
        );

        return { token };
      } else {
        throw new NotFoundException('user Not found');
      }
    } else {
      throw new NotFoundException('user Not found');
    }
  }
  async getAllUserQuizes(auth: IAuth, page: number): Promise<any> {
    const [quizes, count] = await Quiz.findAndCount({
      where: { user: { id: auth.authUser.id } },
      take: 6,
      skip: (page - 1) * 6,
    });

    let noOfPages = Math.ceil(count / 6);

    let data = [];
    quizes.forEach((quiz, i) => {
      data[i] = {};
      data[i]['title'] = quiz.title;

      data[i]['noOfQuestions'] = quiz.questions.length;
      data[i]['id'] = quiz.id;
      data[i]['permaLink'] = quiz.permaLink;
    });

    return { data, noOfPages };
  }
  async getQuizById({ id, auth }): Promise<any> {
    let quiz = await Quiz.findOne({
      where: { id: id },
      loadRelationIds: true,
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not Found');
    }

    if (quiz.user != auth.authUser.id) {
      throw new ForbiddenException('Only created user can accsess this quiz');
    }
    if (quiz.isPublished) {
      throw new BadRequestException('Quiz already published');
    }

    quiz.questions = quiz?.questions?.map((que) => {
      delete que['id'];
      return que;
    });

    return quiz;
  }
}
