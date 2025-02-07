const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");

exports.handler = async (event, context) => {
  try {

    // Authenticate request
    const authResponse = await verifyToken(event);
    if (!authResponse.success) return authResponse;
    
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
      // Insert lead into the database
      await service.createLead(parameter);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.CREATED,
        message: "Lead created successfully.",
      });
    } else if (parameter.reqType === "u") {
      // Update lead in the database
      await service.updateLead(parameter);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: "Lead updated successfully.",
      });
    } else {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: "Invalid request type. Use 's' for insert and 'u' for update.",
      });
    }
  } catch (error) {
    console.error("Error in manageLeads handler: ", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to process request. Please try again later.",
    });
  }
};
