const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");

exports.handler = async (event, context) => {
  try {
    const parameters = JSON.parse(event.body);

    const validationSchema = await Schema.validateAsync(parameters);
    if (validationSchema.error) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: validationSchema.error.details[0].message,
      });
    }

    const { donorDetails, receiptAttachment } = parameters;

    const mailStatus = await service.sendEmail(donorDetails, receiptAttachment);

    if (!mailStatus) {
      console.error("Failed to send email.");
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
        message: "Failed to send email.",
      });
    }

    if (mailStatus.rejected && mailStatus.rejected.length > 0) {
      console.error("Email rejected for:", mailStatus.rejected);
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
        message: `Failed to send email. ${mailStatus.rejected}`,
      });
    }

    if (mailStatus.accepted && mailStatus.accepted.length === 0) {
      console.error("Email was not accepted by the server.");
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
        message: "Email was not accepted by the server.",
      });
    }

    if (mailStatus.accepted && mailStatus.accepted.length > 0) {
      console.log("Email sent successfully, message ID =", mailStatus.messageId);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: `Email sent successfully, message ID = ${mailStatus.messageId}`,
      });
    }
  } catch (error) {
    console.error("Error in sendEmail handler:", error.message || error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: `Failed to send email. ${error.message || "Unknown error"}`,
    });
  }
};