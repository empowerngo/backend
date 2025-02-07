const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object().keys({
  ngoName: Joi.string().required(),
  ngoAddress: Joi.string().required(),
  ngoCity: Joi.string().required(),
  ngoState: Joi.string().required(),
  ngoCountry: Joi.string().required(),
  ngoPinCode: Joi.string().required(),
  ngoEmail: Joi.string().email().required(),
  ngoContact: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  ngo80GNumber: Joi.string().required(),
  ngo12ANumber: Joi.string().required(),
  ngoCSRNumber: Joi.string().optional().allow(null, ""),
  ngoFCRANumber: Joi.string().optional().allow(null, ""),
  ngoPAN: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required(),
  contactPerson: Joi.string().required(),
  ngoRegNumber: Joi.string().required(),
});

module.exports = schema;
