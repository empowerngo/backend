const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");

exports.handler = async (event, context) => {
    try {
        console.info("uploadCSV API invoked");

        // Authenticate user
        const token = event.headers?.Authorization?.split(" ")[1] || null;
        if (!token) {
            return getResponseObject({
                status: false,
                statusCode: HTTP_CODE.UNAUTHORIZED,
                message: "Unauthorized: Missing token",
            });
        }

        const authResponse = await verifyToken(event.headers?.Authorization || event.headers?.authorization);
        if (!authResponse) {
            return getResponseObject({
                status: false,
                statusCode: HTTP_CODE.UNAUTHORIZED,
                message: "Invalid or missing token",
            });
        }

        const user = authResponse;
        console.log("Authenticated user:", user);

        // Parse request payload
        const requestBody = JSON.parse(event.body);
        // const validationSchema = Schema.validate(requestBody, { abortEarly: false });

        // if (validationSchema.error) {
        //     return getResponseObject({
        //         status: false,
        //         statusCode: HTTP_CODE.BAD_REQUEST,
        //         message: validationSchema.error.details.map(err => err.message).join(", "),
        //     });
        // }

        // Validate input schema
        const validationSchema = await Schema.validate(requestBody);
        if (validationSchema.error) {
            console.log("validationSchema.error - ", validationSchema.error);
            return getResponseObject({
                status: false,
                statusCode: HTTP_CODE.BAD_REQUEST,
                message: validationSchema.error.details[0].message,
            });
        }

        const { ngoId, donationType, csvData } = requestBody;
        console.log("ngoId - ", ngoId);
        console.log("donationType - ", donationType);
        console.log("csvData - ", csvData);

        // Store data into database
        const result = await service.storeCSVData(csvData, ngoId, donationType);

        console.log("result - ", result);

        return getResponseObject({
            status: true,
            statusCode: HTTP_CODE.SUCCESS,
            message: "CSV data uploaded successfully",
            payload: result,
        });

    } catch (error) {
        console.error("Error in uploadCSV handler:", error);
        return getResponseObject({
            status: false,
            statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
            message: "Failed to upload CSV data",
            error: error.message
        });
    }
};
