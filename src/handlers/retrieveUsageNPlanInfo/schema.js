const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  ngoID: Joi.number().required(),
});

module.exports = schema;
