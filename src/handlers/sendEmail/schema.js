const Joi = require("/opt/nodejs/node_modules/joi");

const schema = Joi.object({
  donorDetails: Joi.object({
    donorFName: Joi.string().required(), // Corrected to string
    donorLName: Joi.string().required(), // Corrected to string
    donorEmail: Joi.string().email().required(), // Corrected to string and added email validation
    ngoName: Joi.string().required(), // Corrected to string
    contactPerson: Joi.string().required(), // Corrected to string
    ngoContactNo: Joi.string().pattern(/^[0-9]+$/).required(), // Corrected to string and added number pattern validation
  }).required(), // Added required to the donorDetails object.

  receiptAttachment: Joi.object({
    filename: Joi.string().required(),
    contentType: Joi.string().valid('application/pdf').required(), // Ensures it's a PDF
    content: Joi.binary().encoding('base64').required(), // Expects base64 encoded PDF data
  }).required(), // Added required to the receiptAttachment object.

});

module.exports = schema;