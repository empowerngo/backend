const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object().keys({
  reqType: Joi.string().valid("s", "u").required(),
  firstName: Joi.string().when("reqType", { is: "s", then: Joi.required(), otherwise: Joi.optional() }),
  lastName: Joi.string().when("reqType", { is: "s", then: Joi.required(), otherwise: Joi.optional() }),
  email: Joi.string().email().when("reqType", { is: "s", then: Joi.required(), otherwise: Joi.optional() }),
  contactNumber: Joi.string().pattern(/^[0-9]{10}$/).when("reqType", { is: "s", then: Joi.required(), otherwise: Joi.optional() }),
  password: Joi.string().min(8).when("reqType", { is: "s", then: Joi.required(), otherwise: Joi.optional() }),
  roleCode: Joi.number().valid(1, 2, 3, 4).when("reqType", { is: "s", then: Joi.required(), otherwise: Joi.optional() }),
  //createdBy: Joi.number().when("reqType", { is: "s", then: Joi.required(), otherwise: Joi.optional() }),
  ngoID: Joi.alternatives().conditional("reqType", {
    is: "s",
    then: Joi.alternatives().conditional("roleCode", { is: 1, then: Joi.forbidden(), otherwise: Joi.required() }),
    otherwise: Joi.optional(), // ngoID is not required when reqType = "u"
  }),
  userID: Joi.number().required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").when("reqType", { is: "u", then: Joi.required(), otherwise: Joi.forbidden() }),
});

module.exports = schema;
