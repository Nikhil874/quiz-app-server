import * as Joi from 'joi';

export const userSchema = Joi.object({
  name: Joi.string().trim().min(3).max(10).required(),
  email: Joi.string()
    .trim()
    .pattern(/^[A-Za-z1-9_.]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{3,6}$/)
    .message("enter valid email")
    .email({
      minDomainSegments: 2,
      tlds: { allow: false },
    })
    .required(),
  password: Joi.string().min(6).required(),
});
