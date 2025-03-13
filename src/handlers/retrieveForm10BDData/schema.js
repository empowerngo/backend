const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  ngoID: Joi.number().required(),
  startDate: Joi.string().required(), 
  endDate: Joi.string().required(), 
  ngo80GNumber: Joi.string().required(), 
  reg80GDate: Joi.string().required(), 
});

module.exports = schema;
