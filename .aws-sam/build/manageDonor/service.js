const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");
const { encrypt, decrypt } = require("/opt/nodejs/utils/cryptohelper.js");

// Get Donor by PAN (Decryption Applied)
exports.getDonorByPAN = async (donorPAN) => {
    try {
        const encryptedPAN = encrypt(donorPAN);
        const result = await sequelize.query(
            "SELECT * FROM TB_DONOR WHERE DONOR_PAN = :donorPAN",
            { replacements: { donorPAN: encryptedPAN }, type: QueryTypes.SELECT }
        );

        if (result.length) {
            const donor = result[0];
            donor.donorFName = decrypt(donor.DONOR_FNAME);
            donor.donorMName = donor.DONOR_MNAME ? decrypt(donor.DONOR_MNAME) : null;
            donor.donorLName = decrypt(donor.DONOR_LNAME);
            donor.donorPAN = decrypt(donor.DONOR_PAN);
            donor.donorEmail = decrypt(donor.DONOR_EMAIL);
            donor.donorMobile = decrypt(donor.DONOR_MOBILE);
            return donor;
        }
        return null;
    } catch (error) {
        console.error("Error fetching donor by PAN:", error);
        throw error;
    }
};

// Get Donor by ID (Decryption Applied)
exports.getDonorByID = async (donorID) => {
    try {
        const result = await sequelize.query(
            "SELECT * FROM TB_DONOR WHERE DONOR_ID = :donorID",
            { replacements: { donorID }, type: QueryTypes.SELECT }
        );

        if (result.length) {
            const donor = result[0];
            donor.donorFName = decrypt(donor.DONOR_FNAME);
            donor.donorMName = donor.DONOR_MNAME ? decrypt(donor.DONOR_MNAME) : null;
            donor.donorLName = decrypt(donor.DONOR_LNAME);
            donor.donorPAN = decrypt(donor.DONOR_PAN);
            donor.donorEmail = decrypt(donor.DONOR_EMAIL);
            donor.donorMobile = decrypt(donor.DONOR_MOBILE);
            return donor;
        }
        return null;
    } catch (error) {
        console.error("Error fetching donor by ID:", error);
        throw error;
    }
};

// Add Donor (Encryption Applied)
exports.addDonor = async (parameter) => {
    try {
        const query = `
        INSERT INTO TB_DONOR 
        (DONOR_FNAME, DONOR_MNAME, DONOR_LNAME, DONOR_ADDRESS, DONOR_CITY, DONOR_STATE, 
         DONOR_COUNTRY, DONOR_PINCODE, DONOR_MOBILE, DONOR_EMAIL, DONOR_PAN, 
         DONOR_PROFESSION, DONOR_TYPE, CREATED_AT, UPDATED_AT) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

        const donorMName = parameter.donorMName && parameter.donorMName.trim() !== "" 
            ? encrypt(parameter.donorMName) 
            : null; 

        const replacements = [
            encrypt(parameter.donorFName.toString()),
            donorMName,
            encrypt(parameter.donorLName.toString()),
            parameter.donorAddress,
            parameter.donorCity,
            parameter.donorState,
            parameter.donorCountry,
            parameter.donorPinCode,
            encrypt(parameter.donorMobile.toString()),
            encrypt(parameter.donorEmail),
            encrypt(parameter.donorPAN.toString()),
            parameter.donorProfession,
            parameter.donorType,
        ];

        const result = await sequelize.query(query, { replacements, type: QueryTypes.INSERT });

        return result[0];
    } catch (error) {
        console.error("Error adding new donor:", error);
        throw error;
    }
};

// Update Donor (Encryption Applied)
exports.updateDonor = async (parameter) => {
    const fields = [];
    const replacements = [];

    // Mapping from parameter names to table column names
    const fieldMapping = {
        donorFName: "DONOR_FNAME",
        donorMName: "DONOR_MNAME",
        donorLName: "DONOR_LNAME",
        donorAddress: "DONOR_ADDRESS",
        donorCity: "DONOR_CITY",
        donorState: "DONOR_STATE",
        donorCountry: "DONOR_COUNTRY",
        donorPinCode: "DONOR_PINCODE",
        donorPAN: "DONOR_PAN",
        donorEmail: "DONOR_EMAIL",
        donorMobile: "DONOR_MOBILE",
        donorProfession: "DONOR_PROFESSION",
        donorType: "DONOR_TYPE",
    };

    // Encrypt necessary fields
    // Object.keys(fieldMapping).forEach((key) => {
    //     if (parameter[key] !== undefined && parameter[key] !== null) {
    //         const value = ["donorFName", "donorMName", "donorLName", "donorPAN", "donorEmail", "donorMobile"].includes(key)
    //             ? encrypt(key === "donorMobile" ? parameter[key].toString() : parameter[key]) // Convert donorMobile to string before encryption
    //             : parameter[key];
        
    //         fields.push(`${fieldMapping[key]} = ?`);
    //         replacements.push(value);
    //     }
    // });

    Object.keys(fieldMapping).forEach((key) => {
        if (parameter[key] !== undefined && parameter[key] !== null) {
            let value = parameter[key]; // Default to the original value
    
            // Encrypt specific fields after converting to string (if needed)
            if (["donorFName", "donorMName", "donorLName", "donorPAN", "donorEmail", "donorMobile"].includes(key)) {
                value = encrypt(value.toString()); 
            }
    
            fields.push(`${fieldMapping[key]} = ?`);
            replacements.push(value);
        }
    });

    if (fields.length === 0) {
        throw new Error("No valid fields provided for update.");
    }

    // Add the donorID as the last parameter for WHERE clause
    replacements.push(parameter.donorID);

    const query = `
        UPDATE TB_DONOR 
        SET ${fields.join(", ")}, UPDATED_AT = NOW() 
        WHERE DONOR_ID = ?`;

    const result = await sequelize.query(query, { replacements, type: QueryTypes.UPDATE });
    return result[1] > 0; // Returns true if at least one row was updated
};

// Map Donor to NGO (No changes needed)
exports.mapDonorToNGO = async (donorID, donorNGOID) => {
    try {
        if (!(await exports.getDonorMapping(donorID, donorNGOID))) {
            await sequelize.query(
                "INSERT INTO TB_NGO_DONOR_MAPPING (DONOR_ID, NGO_ID) VALUES (:donorID, :donorNGOID)",
                { replacements: { donorID, donorNGOID }, type: QueryTypes.INSERT }
            );
        }
    } catch (error) {
        console.error("Error mapping donor to NGO:", error);
        throw error;
    }
};

// Get Donor Mapping (No changes needed)
exports.getDonorMapping = async (donorID, donorNGOID) => {
    try {
        const result = await sequelize.query(
            "SELECT * FROM TB_NGO_DONOR_MAPPING WHERE DONOR_ID = :donorID AND NGO_ID = :donorNGOID",
            { replacements: { donorID, donorNGOID }, type: QueryTypes.SELECT }
        );
        return result.length > 0;
    } catch (error) {
        console.error("Error checking donor mapping:", error);
        throw error;
    }
};
