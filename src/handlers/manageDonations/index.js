const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js"); // Import authentication middleware
exports.handler = async (event, context) => {
  try {

    // Authenticate request
    const authResponse = await verifyToken(event);
    if (!authResponse.success) return authResponse;

    // Extract user details from the token
    const user = authResponse.user;
    if (![1,2, 3].includes(user.role)) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.FORBIDDEN,
        message: "Only NGO-Admin or NGO-Staff can manage donations.",
      });
    }
    
    const parameter = JSON.parse(event.body);

    // Validate input schema
    const validationSchema = await Schema.validate(parameter);
    if (validationSchema.error) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: validationSchema.error.details[0].message,
      });
    }

    // Check role-based permissions
    if (parameter.reqType === "s" && ![1, 2, 3].includes(parameter.roleCode)) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.FORBIDDEN,
        message: "Only NGO-Admin or NGO-Staff can manage donations.",
      });
    }
    if (parameter.reqType === "u" && ![1, 2].includes(parameter.roleCode)) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.FORBIDDEN,
        message: "Only NGO-Admin or Super admin can manage donations",
      });
    }

    // Insert donation
    if (parameter.reqType === "s") {
      const receiptNumber = await service.generateReceiptNumber(parameter.ngoID);
      await service.createDonation(parameter, receiptNumber);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.CREATED,
        message: "Donation recorded successfully.",
        payload: { receiptNumber },
      });
    }

    // Update donation
    if (parameter.reqType === "u") {
      await service.updateDonation(parameter);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: "Donation updated successfully.",
      });
    }

    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.BAD_REQUEST,
      message: "Invalid request type.",
    });

  } catch (error) {
    console.error("Error in manageDonation handler: ", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to process donation request.",
    });
  }
};
