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

    const { DONATION_ID, DONOR_ID, NGO_ID } = parameters;
    const receiptData = await service.fetchReceiptData(DONATION_ID, DONOR_ID, NGO_ID);

    if (!receiptData) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.NOT_FOUND,
        message: "Receipt data not found.",
      });
    }

    return getResponseObject({
      status: true,
      statusCode: HTTP_CODE.SUCCESS,
      message: "Receipt data retrieved successfully.",
      payload: receiptData,
    });
  } catch (error) {
    console.error("Error in retrieveReceiptData handler:", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve receipt data.",
    });
  }
};
