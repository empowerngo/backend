const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");

exports.handler = async (event, context) => {
  try {
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

    // Authenticate user
    const user = await service.authenticateUser(parameter.email, parameter.password);
    if (!user) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.UNAUTHORIZED,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = await service.generateToken(user);

    return getResponseObject({
      status: true,
      statusCode: HTTP_CODE.SUCCESS,
      message: "Login successful.",
      payload: { token, user },
    });

  } catch (error) {
    console.error("Error in login handler: ", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to process login request.",
    });
  }
};
