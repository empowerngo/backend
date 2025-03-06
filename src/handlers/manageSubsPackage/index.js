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
        message: "Only admins can manage subscription packages.",
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

    // Process request
    if (parameter.reqType === "s") {
      //if (parameter.action === "create") {
        const planID = await service.createPlan(parameter);
        return getResponseObject({
          status: true,
          statusCode: HTTP_CODE.CREATED,
          message: "Subscription plan created successfully.",
          payload: { planID },
        });
      // } else if (parameter.action === "update") {
      //   const updated = await service.updatePlan(parameter);
      //   return getResponseObject({
      //     status: updated,
      //     statusCode: updated ? HTTP_CODE.SUCCESS : HTTP_CODE.NOT_FOUND,
      //     message: updated ? "Plan updated successfully." : "Plan not found.",
      //   });
      // } else if (parameter.action === "delete") {
      //   const deleted = await service.deletePlan(parameter.planID);
      //   return getResponseObject({
      //     status: deleted,
      //     statusCode: deleted ? HTTP_CODE.SUCCESS : HTTP_CODE.NOT_FOUND,
      //     message: deleted ? "Plan deleted successfully." : "Plan not found.",
      //   });
      // }
    } else if (parameter.reqType === "u") {
      const updated = await service.updatePlanStatus(parameter.planID, parameter.status);
      return getResponseObject({
        status: updated,
        statusCode: updated ? HTTP_CODE.SUCCESS : HTTP_CODE.NOT_FOUND,
        message: updated ? "Plan status updated successfully." : "Plan not found.",
      });
    } else {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: "Invalid reqType.",
      });
    }
  } catch (error) {
    console.error("Error in manageSubsPackage handler:", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to process request.",
    });
  }
};
