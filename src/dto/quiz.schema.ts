import * as Joi from 'joi';
import { IQuestion } from 'src/quiz/quiz.entity';
export class CreateQuizDto {
  public title: string;
  public questions: IQuestion[];
}

export const quizSchema = Joi.object({
  title: Joi.string().trim().min(3).required(),
  questions: Joi.array()
    .min(1)
    .message('you cannot create an empty quiz quiz')
    .max(10)
    .message('you can only add 10 questions per quiz')
    .unique('question')
    .message('A quiz cannot have duplicate question')
    .items(
      Joi.object({
        question: Joi.string().trim().min(3).required(),
        options: Joi.array()
          .min(2)
          .message('min two options required')
          .max(5)
          .message('youcannot exceed 5 options')
          .unique((a, b) => a.text == b.text)
          .message('you cannot have duplicate options')
          .items(
            Joi.object({
              text: Joi.string()
                .trim()
                .min(1)
                .error(new Error('option must not be empty'))
                .required(),
              isCorrect: Joi.boolean()
                .error(new Error('is Correct is boolean'))
                .required(),
            }),
          ),
      }),
    ),
});

export const PageSchema = Joi.number()
  .error(new Error('page must be a number'))
  .default(1);
