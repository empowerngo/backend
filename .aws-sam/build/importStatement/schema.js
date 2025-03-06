const Joi = require("/opt/nodejs/node_modules/joi");

const csvRecordSchema = Joi.object({
    // txnDate: Joi.string()
    //     .custom((value, helpers) => {
    //         const parsedDate = moment(value, "DD-MM-YYYY", true);
    //         if (!parsedDate.isValid()) {
    //             return helpers.error("any.invalid");
    //         }
    //         return parsedDate.toISOString(); // Convert to ISO format
    //     })
    //     .required(),
    txnDate: Joi.string().required(),
    description: Joi.string().required(),
    transactionID: Joi.string().required(),
    amount: Joi.string().required()
});

const schema = Joi.object({
    ngoId: Joi.number().required(),
    donationType: Joi.string().valid("FCRA", "Domestic").required(),
    csvData: Joi.array().items(csvRecordSchema).min(1).required()
});

module.exports = schema;
