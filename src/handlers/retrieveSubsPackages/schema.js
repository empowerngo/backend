const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  reqType: Joi.string().valid("fetch").required(),
  planID: Joi.number().optional(),
  
});

module.exports = schema;
