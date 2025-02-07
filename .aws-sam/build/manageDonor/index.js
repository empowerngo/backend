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
    if (![2, 3].includes(user.role)) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.FORBIDDEN,
        message: "Only NGO-Admin or NGO-Staff can manage donors.",
      });
    }
    const parameter = JSON.parse(event.body);

    // Validate incoming request payload
    const validationSchema = await Schema.validate(parameter);
    if (validationSchema.error) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: validationSchema.error.details[0].message,
      });
    }

    if (parameter.reqType === "s") {
      // Insert donor into the database
      await service.createDonor(parameter);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.CREATED,
        message: "Donor created successfully.",
      });
    } else if (parameter.reqType === "u") {
      // Update donor in the database
      await service.updateDonor(parameter);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: "Donor updated successfully.",
      });
    } else {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: "Invalid request type. Use 's' for insert and 'u' for update.",
      });
    }
  } catch (error) {
    console.error("Error in manageDonor handler: ", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to process request. Please try again later.",
    });
  }
};
