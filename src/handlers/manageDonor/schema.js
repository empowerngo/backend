// const { Joi } = require("common-layer/utils/packageExports.js");
const Joi = require("joi"); // ✅ Works both locally & in AWS Lambda

const schema = Joi.object().keys({
    reqType: Joi.string().valid("s", "u").required(),
    donorID: Joi.number().when("reqType", {
        is: "u",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorMName: Joi.string().optional().allow(null, ""),
    donorFName: Joi.string().when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorLName: Joi.string().when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorAddress: Joi.string().when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorCity: Joi.string().when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorState: Joi.string().when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorCountry: Joi.string().when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorPinCode: Joi.string().when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorPAN: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorEmail: Joi.string().email().when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorMobile: Joi.string().pattern(/^[0-9]{10}$/).when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorProfession: Joi.string().when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorType: Joi.string().valid("Individual", "Corporate", "Group", "NGO").when("reqType", {
        is: "s",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    donorNGOID: Joi.number().required()
});

module.exports = schema;
