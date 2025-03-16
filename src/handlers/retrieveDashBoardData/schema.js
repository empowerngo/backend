const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  roleCode: Joi.number().valid(1, 2).required(),
  ngoID: Joi.number().when("roleCode", {
    is: 2,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  startYear: Joi.number().required(),
  endYear: Joi.number().required(),
});

module.exports = schema;
