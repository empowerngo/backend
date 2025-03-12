const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  reqType: Joi.string().valid("s", "u").required(),
  // action: Joi.string().valid("create", "update", "delete").when("reqType", {
  //   is: "s",
  //   then: Joi.required(),
  //   otherwise: Joi.forbidden(),
  // }),
  planID: Joi.number().when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  planName: Joi.string().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  planPrice: Joi.number().positive().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  planValidity: Joi.number().positive().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  planStatus: Joi.string().valid("ACTIVE", "INACTIVE").when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  numberOfUsers: Joi.number().min(1).required(),
  numberOfProjects: Joi.number().min(0).required(),
  numberOfDonations: Joi.number().min(0).required(),
  form10BdData: Joi.boolean().default(false),
  form10BEMail: Joi.boolean().default(false),
  caAccess: Joi.boolean().default(false)
});

module.exports = schema;
