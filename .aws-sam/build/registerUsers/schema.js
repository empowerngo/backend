const Joi = require("/opt/nodejs/node_modules/joi");


const schema = Joi.object().keys({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  contactNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(8).required(),
  roleCode: Joi.number().valid(1, 2, 3, 4).required(),
  createdBy: Joi.number().required(),
  ngoID: Joi.number().when("roleCode", {
    is: 1,
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
});

module.exports = schema;
