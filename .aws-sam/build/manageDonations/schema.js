const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object().keys({
  reqType: Joi.string().valid("s", "u").required(),
  roleCode: Joi.number().valid(1, 2, 3, 4).required(),
  donorID: Joi.number().required(),
  ngoID: Joi.number().when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  amount: Joi.number().positive().required(),
  bank: Joi.string().required(),
  type: Joi.string().valid("Cash", "NEFT", "PhonePe", "InKind").required(),
  transactionID: Joi.string().optional().allow(""),
  purpose: Joi.string().required(),
  project: Joi.string().optional().allow(""),
  donationDate: Joi.string().isoDate().required(),
  note: Joi.string().optional().allow(""),
});

module.exports = schema;
