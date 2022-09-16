import * as Joi from 'joi';

export const answerSchema = Joi.array()
  .min(0)
  .max(10)

  .items(
    Joi.object({
      questionId: Joi.string().required().error(new Error('invalid question')),
      options: Joi.array()
        .unique((a, b) => a == b)
        .error(new Error('invalid options'))

        .min(0)
        .max(5)
        .items(
          Joi.number().valid(0, 1, 2, 3, 4).error(new Error('invalid options')),
        ),
    }),
  );
