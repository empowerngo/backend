const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");

exports.handler = async (event, context) => {
  try {
    const token = event.headers?.Authorization?.split(" ")[1] || null;
    if (!token) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Unauthorized",
      });
    }

    const authResponse = await verifyToken(event.headers?.Authorization || event.headers?.authorization);
    if (!authResponse) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Invalid or missing token",
      });
    }

    const parameters = JSON.parse(event.body);
    const validationSchema = await Schema.validate(parameters);
    if (validationSchema.error) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: validationSchema.error.details[0].message,
      });
    }

    const { ngoID, startDate, endDate, ngo80GNumber, reg80GDate } = parameters;

    const csvData = await service.fetchForm10BDData(ngoID, startDate, endDate, ngo80GNumber, reg80GDate);

    if (!csvData) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.NOT_FOUND,
        message: "Data not found.",
      });
    }

    const base64Csv = Buffer.from(csvData).toString('base64'); // Encode CSV to base64

    return getResponseObject({
      status: true,
      statusCode: HTTP_CODE.SUCCESS,
      message: "CSV data retrieved successfully.",
      payload: base64Csv, // Send base64-encoded CSV in payload
    });
  } catch (error) {
    console.error("Error in retrieveForm10BDData handler:", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve receipt data.",
    });
  }
};