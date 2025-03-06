const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  ngoID: Joi.string().required(), 
  
});

module.exports = schema;
