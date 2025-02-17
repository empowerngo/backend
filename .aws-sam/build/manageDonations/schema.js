const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object().keys({
  reqType: Joi.string().valid("s", "u").required(),
  donorID: Joi.number().required(),
  ngoID: Joi.number().required(),
  donationID: Joi.number().when("reqType", {
    is: "u",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  amount: Joi.number().positive().required(),
  bank: Joi.string().required(),
  type: Joi.string().valid("Cash", "E-Transfer", "PhonePe", "InKind", "Cheque").required(),
  transactionID: Joi.string().optional().allow(""),
  purpose: Joi.string().required(),
  project: Joi.string().required(),
  donationDate: Joi.string().isoDate().when("reqType", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  note: Joi.string().optional().allow(""),
});

module.exports = schema;
