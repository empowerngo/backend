const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = schema;
