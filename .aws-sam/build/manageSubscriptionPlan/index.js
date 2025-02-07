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
     if (![1].includes(user.role)) {
       return getResponseObject({
         status: false,
         statusCode: HTTP_CODE.FORBIDDEN,
         message: "Only Super Admin role can manage Plans.",
       });
     }
    const parameter = event.body ? JSON.parse(event.body) : {};

    if (parameter.reqType === "r") {
      // Retrieve subscription plans
      const plans = await service.getPlans();
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: "Subscription plans retrieved successfully.",
        payload: plans,
      });

    } else if (["s", "u"].includes(parameter.reqType)) {
      // Ensure only SuperAdmin (ROLE_CODE = 1) can create/update plans
      if (parameter.roleCode !== 1) {
        return getResponseObject({
          status: false,
          statusCode: HTTP_CODE.FORBIDDEN,
          message: "Unauthorized. Only SuperAdmin can manage subscription plans.",
        });
      }

      if (parameter.reqType === "s") {
        // Create new plan
        const planID = await service.createPlan(parameter);
        return getResponseObject({
          status: true,
          statusCode: HTTP_CODE.CREATED,
          message: "Subscription plan created successfully.",
          payload: { planID },
        });

      } else if (parameter.reqType === "u") {
        // Update existing plan
        if (!parameter.planID) {
          return getResponseObject({
            status: false,
            statusCode: HTTP_CODE.BAD_REQUEST,
            message: "Plan ID is required for updating a subscription plan.",
          });
        }

        await service.updatePlan(parameter);
        return getResponseObject({
          status: true,
          statusCode: HTTP_CODE.SUCCESS,
          message: "Subscription plan updated successfully.",
        });
      }
    } else {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: "Invalid request type. Use 'r' for retrieve, 's' for insert, or 'u' for update.",
      });
    }
  } catch (error) {
    console.error("Error in manageSubscriptionPlan handler: ", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to process subscription plan request.",
    });
  }
};
