const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object().keys({
  donorID: Joi.string().when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  donorFName: Joi.string().required(),
  donorMName: Joi.string().optional().allow(""),
  donorLName: Joi.string().required(),
  donorAddress: Joi.string().required(),
  donorCity: Joi.string().required(),
  donorState: Joi.string().required(),
  donorCountry: Joi.string().required(),
  donorPinCode: Joi.string().required(),
  donorMobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  donorEmail: Joi.string().email().required(),
  donorPAN: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional()
    .allow(""),
  donorProfession: Joi.string().optional().allow(""),
  donorNGOID: Joi.string().required(),
  donorType: Joi.string().required(),
  reqType: Joi.string()
    .valid("s", "u")
    .required(),
});

module.exports = schema;
