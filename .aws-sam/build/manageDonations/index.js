const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js"); // Import authentication middleware
exports.handler = async (event, context) => {
  try {

    // Authenticate request
    const authResponse = await verifyToken(event.headers?.Authorization || event.headers?.authorization);

    if (!authResponse) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Invalid or missing token",
      });
    }

    // Extract user details from the token
    const user = authResponse;
    if (![2, 3].includes(user.role)) {
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
   
    if (parameter.reqType === "u" && ![2].includes(user.role)) {
      console.log("user role",user.role );
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.FORBIDDEN,
        message: "Only NGO-Admin can update donations",
      });
    }

    // Insert donation
    if (parameter.reqType === "s") {
      const receiptNumber = await service.generateReceiptNumber(parameter.ngoID);
      await service.createDonation(parameter, receiptNumber);

      if (parameter.statementID){
        await service.createDonation(parameter.statementID, parameter.ngoID);
      }
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.CREATED,
        message: "Donation recorded successfully.",
        payload: { receiptNumber },
      });
    }

    // Update donation
    if (parameter.reqType === "u" && user.role == 2) {
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
