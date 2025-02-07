const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object().keys({
  ngoID: Joi.number().required(),
  roleCode: Joi.number().valid(1).required(),  // Only SuperAdmin can update NGO details
  ngoName: Joi.string().optional(),
  ngoAddress: Joi.string().optional(),
  ngoCity: Joi.string().optional(),
  ngoState: Joi.string().optional(),
  ngoCountry: Joi.string().optional(),
  ngoPinCode: Joi.string().optional(),
  ngoEmail: Joi.string().email().optional(),
  ngoContact: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
  ngo80GNumber: Joi.string().optional(),
  ngo12ANumber: Joi.string().optional(),
  ngoCSRNumber: Joi.string().optional().allow(null, ""),
  ngoFCRANumber: Joi.string().optional().allow(null, ""),
  ngoPAN: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional(),
  contactPerson: Joi.string().optional(),
  ngoRegNumber: Joi.string().optional(),
  status: Joi.string().valid("Active", "Inactive").optional(),
});

module.exports = schema;
