const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object().keys({
  planID: Joi.number().when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  planName: Joi.string().required(),
  planPrice: Joi.number().precision(2).required(),
  planStatus: Joi.string().valid("Active", "Inactive").required(),
  numberOfUsers: Joi.number().integer().min(1).required(),
  numberOfDonors: Joi.number().integer().min(1).required(),
  numberOfDonations: Joi.number().integer().min(1).required(),
  form10BEReport: Joi.string().valid("Yes", "No").required(),
  reqType: Joi.string().valid("r", "s", "u").required(),
  roleCode: Joi.number().valid(1).required(), // Only SuperAdmin can create/update
});

module.exports = schema;
