const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");

exports.handler = async (event, context) => {
  try {

     // Authenticate request
     const authResponse = await verifyToken(event);
     if (!authResponse.success) return authResponse;
 
     // Extract user details from the token
     const user = authResponse.user;
     if (![1].includes(user.role)) {
       return getResponseObject({
         status: false,
         statusCode: HTTP_CODE.FORBIDDEN,
         message: "Only Super Admin role can register NGOs.",
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

    // Check if NGO already exists (by email or PAN)
    const existingNGO = await service.checkExistingNGO(parameter.ngoEmail, parameter.ngoPAN);
    if (existingNGO) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.CONFLICT,
        message: "An NGO with this Email or PAN already exists.",
      });
    }

    // Register the NGO
    const ngoID = await service.registerNGO(parameter);

    return getResponseObject({
      status: true,
      statusCode: HTTP_CODE.CREATED,
      message: "NGO registered successfully.",
      payload: { ngoID },
    });

  } catch (error) {
    console.error("Error in registerNGO handler: ", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to register NGO. Please try again later.",
    });
  }
};
