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

    const { donorDetails, receiptAttachmentPath } = parameters;
    const mailStatus = await service.sendEmail(donorDetails, receiptAttachmentPath);

      if (mailStatus.rejected.length > 0) {
      console.error("Email rejected for:", mailStatus.rejected);
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
        message: `Failed to retrieve receipt data. ${mailStatus.rejected}`,
      });
    }

    if (info.accepted.length === 0) {
      console.error("Email was not accepted by the server.");
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
        message: `Email was not accepted by the server`,
      });
    }

    if (info.accepted.length > 0) {
      console.error("Email sent successfully, message ID =", mailStatus.messageId);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: `Email sent successfully, message ID = ${mailStatus.messageId}`,
      });
    }  
  } catch (error) {
    console.error("Error in sendEmail handler:", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to sendEmail.",
    });
  }
};
