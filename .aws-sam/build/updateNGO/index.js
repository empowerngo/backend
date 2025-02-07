const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");  // Import authentication middleware
                                    
exports.handler = async (event, context) => {
  try {    
      // // Authenticate request
      // const authResponse = await verifyToken(event);
      // if (!authResponse.success) return authResponse;
  
      // // Extract user details from token
      // const user = authResponse.user;
      // if (user.role !== 1) {
      //   return getResponseObject({
      //     status: false,
      //     statusCode: HTTP_CODE.FORBIDDEN,
      //     message: "Only SuperAdmin can update NGO details.",
      //   });
      // }

      console.log("Event Headers:", event.headers); // Debugging Log

    // Extract Authorization header
    let token = event.headers?.Authorization || event.headers?.authorization;

    if (!token) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Missing authentication token.",
      });
    }

    // Log token before verifying
    console.log("Extracted Token:", token);

    const decodedUser = await verifyToken(token);
    if (!decodedUser) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Invalid or expired token.",
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

    // Only SuperAdmin (ROLE_CODE = 1) is allowed to update NGO details
    if (parameter.roleCode !== 1) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.FORBIDDEN,
        message: "Only SuperAdmin can update NGO details.",
      });
    }

    // Check if NGO exists
    const existingNGO = await service.getNGOById(parameter.ngoID);
    if (!existingNGO) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.NOT_FOUND,
        message: "NGO not found.",
      });
    }

    // Update NGO details
    await service.updateNGO(parameter);

    return getResponseObject({
      status: true,
      statusCode: HTTP_CODE.SUCCESS,
      message: "NGO details updated successfully.",
    });

  } catch (error) {
    console.error("Error in updateNGO handler: ", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to update NGO details. Please try again later.",
    });
  }
};
