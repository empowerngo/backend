const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  reqType: Joi.string().valid("s", "u", "g").required(),
  purposeID: Joi.number().when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  ngoID: Joi.number().required(),
  projectID: Joi.number().required(),
  purposeName: Joi.string().when("reqType", {
    is: "s" ||"u",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  createdBy: Joi.number().when("reqType", {
    is: "s" || "u",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

module.exports = schema;
