import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { User } from 'src/users/user.entity';
import { Quiz } from './quiz.entity';
import { v4 as uuidv4 } from 'uuid';
export interface IAnswer {
  question: string;
  options: string[];
}
function isMultiple(options) {
  let ans = 0;
  options.forEach((opt) => {
    if (opt['isCorrect']) {
      ans++;
    }
  });
  if (ans > 1) {
    return true;
  } else {
    return false;
  }
}

@Injectable()
export class QuizService {
  async getAllPublishedQuizes(page: number): Promise<any> {
    const [result, count] = await Quiz.findAndCount({
      where: { isPublished: true },
      take: 6,
      skip: (page - 1) * 6,
    });

    let noOfPages = Math.ceil(count / 6);

    let data = [];
    result.forEach((quiz, i) => {
      data[i] = {};
      data[i]['title'] = quiz.title;

      data[i]['noOfQuestions'] = quiz.questions.length;
      data[i]['id'] = quiz.id;
      data[i]['permaLink'] = quiz.permaLink;
    });
    return { data, noOfPages };
  }

  async createQuiz({
    title,
    questions,
    auth,
  }): Promise<{ message: string; quizId: number }> {
    const user = await User.findOne({ where: { id: auth.authUser.id } });
    if (!user) {
      throw new UnauthorizedException('User Not Found');
    }
    questions = questions.map((question, index) => {
      let count = 0;
      for (let i = 0; i < question.options.length; i++) {
        if (question.options[i].isCorrect == true) {
          count++;
        }
      }
      if (question.options.length == 2) {
        if (isMultiple(question.options)) {
          throw new BadRequestException(
            'multiple choice question must have atleast three options',
          );
        }
      }
      if (count == 0) {
        throw new BadRequestException('atleast one correct answer required');
      }
      question.id = uuidv4();
      return question;
    });

    const quiz = new Quiz();
    quiz.user = user;
    quiz.title = title;

    quiz.questions = questions;
    let createdQuiz = await Quiz.save(quiz);

    return {
      message: 'successfully created the quiz',
      quizId: createdQuiz.id,
    };
  }
  async updateQuiz({
    id,
    title,
    questions,
    auth,
    publish,
  }): Promise<{ message: string }> {
    const quiz = await Quiz.findOne({
      where: { id: id },
      relations: { user: true },
    });
    if (!quiz) {
      throw new NotFoundException('did not find the quiz');
    }
    if (quiz.user.id != auth.authUser.id) {
      throw new ForbiddenException('only can edit the quiz');
    }
    if (quiz.isPublished) {
      throw new BadRequestException('Quiz already published');
    }
    if (publish) {
      quiz.isPublished = true;
      function GenerateAlphaNumeric() {
        let characters =
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        let charactersLength = characters.length;

        for (var i = 0; i < 6; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
          );
        }
        return result;
      }
      let generated = GenerateAlphaNumeric();
      let publishFound = await Quiz.findOne({
        where: { permaLink: generated },
      });
      let count = 0;
      while (publishFound && count < 10) {
        generated = GenerateAlphaNumeric();
        publishFound = await Quiz.findOne({ where: { permaLink: generated } });
        count++;
      }
      if (count == 10) {
        throw new ConflictException(
          'could not generate random link please try again',
        );
      }

      quiz.permaLink = generated;

      let data = await Quiz.save(quiz);
      return { message: 'Quiz has been published successfully' };
    }
    questions = questions.map((question, index) => {
      let count = 0;
      for (let i = 0; i < question.options.length; i++) {
        if (question.options[i].isCorrect == true) {
          count++;
        }
      }
      if (count == 0) {
        throw new BadRequestException('atleast one correct answer required');
      }
      question.id = uuidv4();
      return question;
    });

    quiz.title = title;
    quiz.questions = questions;
    const updatedQuiz = await Quiz.save(quiz);

    return { message: 'Quiz updated sucsessfully' };
  }
  async deleteQuiz({ id, auth }): Promise<{ message: string }> {
    const quiz = await Quiz.findOne({
      where: { id: id },
      relations: { user: true },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    if (quiz.user.id != auth.authUser.id) {
      throw new ForbiddenException('Only owner can delete the quiz');
    }

    const deleted = Quiz.delete(id);
    return { message: `Quiz is Deleted Successfully` };
  }

  async getPublishedQuiz({ id }) {
    const quiz = await Quiz.findOne({ where: { permaLink: id } });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    let data = {};
    data['title'] = quiz.title;
    data['questions'] = [];

    let quizQues = [...quiz.questions];
    quizQues.forEach((ques, i) => {
      data['questions'][i] = {};
      data['questions'][i]['question'] = ques['question'];
      data['questions'][i]['id'] = ques['id'];

      let count = 0;
      data['questions'][i]['options'] = ques.options.map((opt) => {
        if (opt['isCorrect']) {
          count++;
        }
        delete opt['isCorrect'];
        return opt.text;
      });
      if (count > 1) {
        data['questions'][i]['isMultiple'] = true;
      } else {
        data['questions'][i]['isMultiple'] = false;
      }
    });

    return data;
  }
  async verifyTakeQuiz({ id, answers }) {
    let quiz = await Quiz.findOne({ where: { permaLink: id } });
    if (!quiz) {
      throw new BadRequestException('Quiz not found');
    }

    let totalQuestions = [...quiz.questions];

    let score = 0;

    function numCorrect(options) {
      let ans = 0;
      options.forEach((opt) => {
        if (opt['isCorrect']) {
          ans++;
        }
      });
      return ans;
    }
    answers.forEach((answer, i) => {
      totalQuestions.forEach((question, i) => {
        if (answer.questionId == question['id']) {
          //single choice
          if (answer.options.length == 1) {
            if (!isMultiple(question['options'])) {
              if (question['options'][answer.options[0]]['isCorrect'] == true) {
                score++;
              }
            }
          } else {
            //multiple choice
            let ansCount = numCorrect(question['options']);
            if (isMultiple(question['options'])) {
              let count = 0;
              if (answer.options.length == ansCount) {
                answer.options?.forEach((opt) => {
                  if (question['options'][opt]['isCorrect']) {
                    count++;
                  }
                });

                if (count == ansCount) {
                  score++;
                }
              }
            }
          }
        }
      });
    });
    return { score: score, noOfQuestions: totalQuestions.length };
  }
}
