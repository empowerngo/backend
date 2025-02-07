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

     // Check if a USER already exists by Email or MOBILE
     const existingUser = await service.checkExistingUser(parameter.email, parameter.contactNumber);
     if (existingUser) {
       return getResponseObject({
         status: false,
         statusCode: HTTP_CODE.CONFLICT,
         message: "A User with this Email or Mobile Number already exists.",
       });
     }

    // Role-based validation
    if (parameter.roleCode !== 1 && !parameter.ngoID) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: "NGO association is required for this role.",
      });
    }

    // Check subscription limit if NGO-Admin is creating a staff user
    // if (parameter.roleCode === 3) {
    //   const isAllowed = await service.checkUserLimit(parameter.ngoID);
    //   if (!isAllowed) {
    //     return getResponseObject({
    //       status: false,
    //       statusCode: HTTP_CODE.FORBIDDEN,
    //       message: "User limit exceeded for this NGO subscription.",
    //     });
    //   }
    // }

    // Create user
    const userID = await service.createUser(parameter);
    
    // If not SuperAdmin, associate user with NGO
    if (parameter.roleCode !== 1) {
      await service.linkUserToNGO(userID, parameter.ngoID);
    }

    return getResponseObject({
      status: true,
      statusCode: HTTP_CODE.CREATED,
      message: "User registered successfully.",
    });

  } catch (error) {
    console.error("Error in user registration: ", error);
    return getResponseObject({
      status: false,
      statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
      message: "Failed to create user.",
    });
  }
};
