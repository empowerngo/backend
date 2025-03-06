const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");

exports.handler = async (event) => {
  try {
    // Extract token from headers
    const token = event.headers?.Authorization?.split(" ")[1] || null;
    if (!token) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Unauthorized",
      });
    }

    // Authenticate request
    const authResponse = await verifyToken(event.headers.Authorization);
    if (!authResponse || authResponse.role !== 1) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.FORBIDDEN,
        message: "Only admins can retrieve subscription packages.",
      });
    }

    // Parse request body
    const parameter = JSON.parse(event.body);
    const validationSchema = await Schema.validate(parameter);
    if (validationSchema.error) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: validationSchema.error.details[0].message,
      });
    }

    let result;
    if (parameter.planID) {
      result = await service.fetchPlanById(parameter.planID);
    } else {
      result = await service.fetchAllPlans();
    }

    return getResponseObject({
      status: true,
      statusCode: HTTP_CODE.SUCCESS,
      message: "Subscription packages retrieved successfully.",
      payload: result,
    });
  } catch (error) {
    console.error("Error in retrieveSubsPackages handler:", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve subscription packages.",
    });
  }
};
