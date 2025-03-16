const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");

exports.handler = async (event, context) => {
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
    const authResponse = await verifyToken(event.headers?.Authorization || event.headers?.authorization);
    if (!authResponse) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Invalid or missing token",
      });
    }

    // Parse request parameters
    const parameter = JSON.parse(event.body);
    const validationSchema = await Schema.validate(parameter);
    if (validationSchema.error) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: validationSchema.error.details[0].message,
      });
    }

    let dashboardData;
    if (parameter.roleCode == 1) {
      dashboardData = await service.fetchSuperAdminData(parameter.startYear, parameter.endYear);
    } else if (parameter.roleCode == 2) {
      if (!parameter.ngoID) {
        return getResponseObject({
          status: false,
          statusCode: HTTP_CODE.BAD_REQUEST,
          message: "ngoID is required for roleCode 2",
        });
      }
      dashboardData = await service.fetchNGOAdminData(parameter.ngoID, parameter.startYear, parameter.endYear);
    } else {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: "Invalid roleCode",
      });
    }

    return getResponseObject({
      status: true,
      statusCode: HTTP_CODE.SUCCESS,
      message: "Dashboard data retrieved successfully.",
      payload: dashboardData,
    });

  } catch (error) {
    console.error("Error in retrieveDashBoardData handler:", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve dashboard data.",
    });
  }
};
