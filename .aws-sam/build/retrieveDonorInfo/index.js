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

    // Extract user details from the token
    // const user = authResponse;
    // if (user.role !== 1) {
    //   return getResponseObject({
    //     status: false,
    //     statusCode: HTTP_CODE.FORBIDDEN,
    //     message: "Only Super Admin can retrieve donor information.",
    //   });
    // }

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
      const donorsList = await service.fetchDonorsList(parameter.ngoID);
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: "Donor list retrieved successfully.",
        payload: donorsList,
      });
    } else if (parameter.reqType === "info") {
      const donorInfo = await service.fetchDonorInfo(parameter.donorID);
      if (!donorInfo) {
        return getResponseObject({
          status: false,
          statusCode: HTTP_CODE.NOT_FOUND,
          message: "Donor not found.",
        });
      }
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: "Donor details retrieved successfully.",
        payload: donorInfo,
      });
    } else if (parameter.reqType === "param") {
      const donorInfo = await service.fetchDonorsListByParams(parameter.donorFName, parameter.donorLName, parameter.donorMobile, parameter.donorPAN);
      if (!donorInfo) {
        return getResponseObject({
          status: false,
          statusCode: HTTP_CODE.NOT_FOUND,
          message: "Donor not found.",
        });
      }
      return getResponseObject({
        status: true,
        statusCode: HTTP_CODE.SUCCESS,
        message: "Donor details retrieved successfully.",
        payload: donorInfo,
      });
    } else {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: "Invalid reqType.",
      });
    }
  } catch (error) {
    console.error("Error in retrieveDonorInfo handler:", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve donor details.",
    });
  }
};
