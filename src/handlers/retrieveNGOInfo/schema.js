const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  reqType: Joi.string().valid("list", "info").required(),
  ngoID: Joi.number().when("reqType", {
    is: "info",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

module.exports = schema;
