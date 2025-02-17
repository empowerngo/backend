const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");

exports.handler = async (event, context) => {
  try {
    // Extract and verify token
    const token = event.headers?.Authorization?.split(" ")[1] || null;
    if (!token) {
      return getResponseObject({ status: false, statusCode: HTTP_CODE.UNAUTHORIZED, message: "Unauthorized" });
    }

    const authResponse = await verifyToken(event.headers?.Authorization || event.headers?.authorization);
    if (!authResponse) {
      return getResponseObject({ status: false, statusCode: HTTP_CODE.UNAUTHORIZED, message: "Invalid or missing token" });
    }

    const user = authResponse;
    console.log("user = ", user);
    const parameter = JSON.parse(event.body);
    console.log("parameter = ", parameter);

    // Validate input
    const validationSchema = await Schema.validate(parameter);
    if (validationSchema.error) {
      return getResponseObject({
        status: false,
        statusCode: HTTP_CODE.BAD_REQUEST,
        message: validationSchema.error.details[0].message,
      });
    }
    console.log("user.role = ", user.role);
    console.log("parameter.roleCode = ", parameter.roleCode);
    console.log("typeof user.role =", typeof user.role, "| user.role =", user.role);
console.log("typeof parameter.roleCode =", typeof parameter.roleCode, "| parameter.roleCode =", parameter.roleCode);
console.log("[3, 4].includes(parameter.roleCode) =", [3, 4].includes(parameter.roleCode));

    if (parameter.reqType === "s") {
      // Role-based restrictions for user creation
      if (![1, 2].includes(Number(user.role)))
        {
          console.log("Inside authRejection");
        return getResponseObject({ status: false, statusCode: HTTP_CODE.FORBIDDEN, message: "Unauthorized action." });
      }

      const existingUserID = await service.checkExistingUser(parameter.email, parameter.contactNumber);

      if (existingUserID) {
        if (parameter.roleCode === 2 || parameter.roleCode === 3) {
          console.log("Calling checkUserNGOLink with parameter - ", existingUserID);
          const isLinked = await service.checkUserNGOLink(existingUserID.USER_ID);
          if (isLinked) {
            return getResponseObject({ status: false, statusCode: HTTP_CODE.CONFLICT, message: "User already linked to an NGO." });
          }
          await service.linkUserToNGO(existingUserID.USER_ID, parameter.ngoID);
        } else if (parameter.roleCode === 4) {
          await service.linkUserToNGO(existingUserID.USER_ID, parameter.ngoID);
        } else {
          return getResponseObject({ status: false, statusCode: HTTP_CODE.CONFLICT, message: "User with this role already exists." });
        }
      } else {
        const userID = await service.createUser(parameter);
        if (parameter.roleCode !== 1) {
          await service.linkUserToNGO(userID, parameter.ngoID);
        }
      }

      return getResponseObject({ status: true, statusCode: HTTP_CODE.CREATED, message: "User registered successfully." });
    }

    if (parameter.reqType === "u") {
      // Role-based restrictions for user creation
      if ((user.role != null && parameter.roleCode != null) && 
      ((Number(user.role) === 1 && ![1, 2].includes(Number(parameter.roleCode))) ||
       (Number(user.role) === 2 && ![3, 4].includes(Number(parameter.roleCode))))) {
        return getResponseObject({ status: false, statusCode: HTTP_CODE.FORBIDDEN, message: "Unauthorized action." });
      }

      const updateResult = await service.updateUserStatus(parameter.userID, parameter.status);
      console.error("updateResult : ", updateResult);  // Debugging

      return updateResult
        ? getResponseObject({ status: true, statusCode: HTTP_CODE.SUCCESS, message: "User status updated successfully." })
        : getResponseObject({ status: false, statusCode: HTTP_CODE.NOT_FOUND, message: "User not found." });
    }

    return getResponseObject({ status: false, statusCode: HTTP_CODE.BAD_REQUEST, message: "Invalid reqType." });

  } catch (error) {
    console.error("Error in user registration: ", error);
    return getResponseObject({ status: false, statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR, message: "Failed to process request." });
  }
};
