const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  DONATION_ID: Joi.number().required(),
  DONOR_ID: Joi.number().required(),
  NGO_ID: Joi.number().required(),
});

module.exports = schema;
