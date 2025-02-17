const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  reqType: Joi.string().valid("s", "u").required(),
  ngoID: Joi.number().when("reqType", {
    is: "s",
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  ngoName: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoAddress: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoCity: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoState: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoCountry: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoPinCode: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoEmail: Joi.string().email().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoContact: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .when("reqType", {
      is: "s",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  ngo80GNumber: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngo12ANumber: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoCSRNumber: Joi.string().optional().allow(null, ""),
  ngoFCRANumber: Joi.string().optional().allow(null, ""),
  ngoPAN: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .when("reqType", {
      is: "s",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  contactPerson: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  authorizedPerson: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ngoRegNumber: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  logoURL: Joi.string().optional().uri().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  signatureURL: Joi.string().optional().uri().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  })
});

module.exports = schema;
