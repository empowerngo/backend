const Joi = require("joi");

const schema = Joi.object({
  donorDetails: Joi.object({
    donorFName: Joi.string().required(),
    donorLName: Joi.string().required(),
    donorEmail: Joi.string().email().required(),
    ngoName: Joi.string().required(),
    contactPerson: Joi.string().required(),
    ngoContactNo: Joi.string().pattern(/^[0-9]+$/).required(),
  }).required(),

  receiptAttachment: Joi.object({
    filename: Joi.string().required(),
    contentType: Joi.string().valid("application/pdf").required(),
    content: Joi.string().base64().required(),
  }).required(),
});

module.exports = schema;