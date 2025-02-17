// index.js
const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");

exports.handler = async (event, context) => {
  try {

    // Extract token from headers
    const token = event.headers?.Authorization?.split(" ")[1] || null;
    if (!token) {
      console.warn("Missing authentication token");
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Unauthorized",
      });
    }

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
    console.log("User --- ", user);
    if (user.role !== 1) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.FORBIDDEN,
        message: "Only Super Admin can manage NGOs.",
      });
    }

    const parameter = JSON.parse(event.body);
    console.log("parameter = ", parameter);
    const validationSchema = await Schema.validate(parameter);
    if (validationSchema.error) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: validationSchema.error.details[0].message,
      });
    }

    if (parameter.reqType === "s") {
      const existingNGO = await service.checkExistingNGO(parameter.ngoEmail, parameter.ngoPAN);
      if (existingNGO) {
        return getResponseObject({
          status: false,
          statusCode: HTTP_CODE.CONFLICT,
          message: "An NGO with this Email or PAN already exists.",
        });
      }
      const ngoID = await service.registerNGO(parameter);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.CREATED,
        message: "NGO registered successfully.",
        payload: { ngoID },
      });
    } else if (parameter.reqType === "u") {
      const updated = await service.updateNGO(parameter);
      return getResponseObject({
        status: updated,
        statusCode: updated ? HTTP_CODE.SUCCESS : HTTP_CODE.NOT_FOUND,
        message: updated ? "NGO updated successfully." : "NGO not found or no changes made.",
      });
    } else {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: "Invalid reqType.",
      });
    }
  } catch (error) {
    console.error("Error in manageNGO handler:", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to process request.",
    });
  }
};
