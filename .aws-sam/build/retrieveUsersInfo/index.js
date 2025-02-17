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
    console.log("AuthRepose - ", authResponse);
    if (!authResponse) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Invalid or missing token",
      });
    }

    // Extract user details from the token
    const user = authResponse;
    if (user.role !== 1) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.FORBIDDEN,
        message: "Only Super Admin can retrieve user information.",
      });
    }

    const parameter = JSON.parse(event.body);
    const validationSchema = await Schema.validate(parameter);
    if (validationSchema.error) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: validationSchema.error.details[0].message,
      });
    }

    if (parameter.reqType === "list") {
      const usersList = await service.fetchUsersList();
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: "User list retrieved successfully.",
        payload: usersList,
      });
    } else if (parameter.reqType === "info") {
      const userInfo = await service.fetchUserInfo(parameter.userID);
      if (!userInfo) {
        return getResponseObject({
          status: false,
          statusCode: HTTP_CODE.NOT_FOUND,
          message: "User not found.",
        });
      }
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: "User details retrieved successfully.",
        payload: userInfo,
      });
    } else {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: "Invalid reqType.",
      });
    }
  } catch (error) {
    console.error("Error in retrieveUsersInfo handler:", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve user details.",
    });
  }
};
