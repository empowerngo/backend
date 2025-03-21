const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  reqType: Joi.string().valid("list", "info", "param").required(),
  donorID: Joi.number().when("reqType", {
    is: "info",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  ngoID: Joi.number().when("reqType", {
    is: "list",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  donorFName: Joi.string().when("reqType", {
    is: "param",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  donorLName: Joi.string().when("reqType", {
    is: "param",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  donorPAN: Joi.string().when("reqType", {
    is: "param",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  donorMobile: Joi.string().when("reqType", {
    is: "param",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  donorAdhar: Joi.string().when("reqType", {
    is: "param",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
}).when(Joi.object({ reqType: Joi.valid('param') }).unknown(), {
  then: Joi.object({
    donorFName: Joi.string().required(),
    donorLName: Joi.forbidden(),
    donorPAN: Joi.forbidden(),
    donorAdhar: Joi.forbidden(),
    donorMobile: Joi.forbidden(),
  }).xor('donorFName', 'donorLName', 'donorPAN', 'donorMobile'),
});


module.exports = schema;
