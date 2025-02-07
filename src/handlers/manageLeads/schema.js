const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object().keys({
  leadID: Joi.string().when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  personFName: Joi.string().required(),
  personLName: Joi.string().required(),
  ngoName: Joi.string().required(),
  contactNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  emailID: Joi.string().email().required(),
  preferredContactTime: Joi.string()
    .valid("Morning", "Noon", "Evening")
    .required(),
  conversionStatus: Joi.string().when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoID: Joi.string().when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  reqType: Joi.string()
    .valid("s", "u")
    .required(),
});

module.exports = schema;
