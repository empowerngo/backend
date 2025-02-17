const { HTTP_CODE, getResponseObject } = require("/opt/nodejs/utils/helper.js");
const service = require("./service");
const Schema = require("./schema");
const { verifyToken } = require("/opt/nodejs/utils/auth.js");

exports.handler = async (event, context) => {
    try {
        console.info("manageDonor API invoked");

        const token = event.headers?.Authorization?.split(" ")[1] || null;
        if (!token) {
            console.warn("Missing authentication token");
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
        console.log("user = ", user);
        if (![2, 3].includes(user.role)) {
            return getResponseObject({
                status: false,
                statusCode: HTTP_CODE.FORBIDDEN,
                message: "Only NGO-Admin or NGO-Staff can manage donors.",
            });
        }

        const parameter = JSON.parse(event.body);
        console.info("Validating request payload...");
        console.log("parameter = ", parameter);

        const validationSchema = Schema.validate(parameter, { abortEarly: false });
        if (validationSchema.error) {
            console.error("Validation Error:", validationSchema.error.details.map(err => err.message));
            return getResponseObject({
                status: false,
                statusCode: HTTP_CODE.BAD_REQUEST,
                message: validationSchema.error.details.map(err => err.message).join(", "),
            });
        }

        if (parameter.reqType === "s") {
            console.info(`Checking donor existence for PAN: ${parameter.donorPAN}`);
            const existingDonor = await service.getDonorByPAN(parameter.donorPAN);
            console.log("existingDonor = ", existingDonor);
            let donorID;
            if (existingDonor) {
                donorID = existingDonor.DONOR_ID;
                console.info(`Donor already exists with ID: ${donorID}, checking NGO mapping...`);
            } else {
                console.info("Creating new donor...");
                donorID = await service.addDonor(parameter);
                console.info(`New donor created with ID: ${donorID}`);
            }

            const mappingExists = await service.getDonorMapping(donorID, parameter.donorNGOID);
            if (!mappingExists) {
                await service.mapDonorToNGO(donorID, parameter.donorNGOID);
                console.info(`Donor ID: ${donorID} mapped to NGO ID: ${parameter.donorNGOID}`);
            } else {
                console.info(`Donor ID: ${donorID} is already mapped to NGO ID: ${parameter.donorNGOID}, skipping mapping.`);
            }

            return getResponseObject({
                status: true,
                statusCode: HTTP_CODE.CREATED,
                message: "Donor added successfully.",
                payload: { donorID },
            });
        } 
        
        if (parameter.reqType === "u") {
            console.info(`Updating donor with ID: ${parameter.donorID}`);

            const donorExists = await service.getDonorByID(parameter.donorID);
            if (!donorExists) {
                return getResponseObject({
                    status: false,
                    statusCode: HTTP_CODE.NOT_FOUND,
                    message: "Donor not found.",
                });
            }

            const updateResult = await service.updateDonor(parameter);
            return updateResult
        ? getResponseObject({ status: true, statusCode: HTTP_CODE.SUCCESS, message: "Donor updated successfully" })
        : getResponseObject({ status: false, statusCode: HTTP_CODE.NOT_FOUND, message: "Donor not found" });
            // return getResponseObject({
            //     status: true,
            //     statusCode: HTTP_CODE.SUCCESS,
            //     message: "Donor updated successfully.",
            // });
        }

        return getResponseObject({
            status: false,
            statusCode: HTTP_CODE.BAD_REQUEST,
            message: "Invalid reqType. Use 's' for save or 'u' for update.",
        });

    } catch (error) {
        console.error("Error in manageDonor handler:", error);
        return getResponseObject({
            status: false,
            statusCode: HTTP_CODE.INTERNAL_SERVER_ERROR,
            message: "Failed to process donor request.",
            error: error.message
        });
    }
};
