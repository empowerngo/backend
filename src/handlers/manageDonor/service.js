const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

exports.getDonorByPAN = async (donorPAN) => {
    try {
        const result = await sequelize.query(
            "SELECT * FROM TB_DONOR WHERE DONOR_PAN = :donorPAN",
            { replacements: { donorPAN }, type: QueryTypes.SELECT }
        );
        return result.length ? result[0] : null;
    } catch (error) {
        console.error("Error fetching donor by PAN:", error);
        throw error;
    }
};

exports.getDonorByID = async (donorID) => {
    try {
        const result = await sequelize.query(
            "SELECT * FROM TB_DONOR WHERE DONOR_ID = :donorID",
            { replacements: { donorID }, type: QueryTypes.SELECT }
        );
        return result.length ? result[0] : null;
    } catch (error) {
        console.error("Error fetching donor by ID:", error);
        throw error;
    }
};

// exports.addDonor = async (data) => {
//     try {
//         const result = await sequelize.query(
//             "INSERT INTO TB_DONOR (...) VALUES (:donorFName, :donorLName, ...)",
//             { replacements: data, type: QueryTypes.INSERT }
//         );
//         return result[0];
//     } catch (error) {
//         console.error("Error adding new donor:", error);
//         throw error;
//     }
// };

exports.addDonor = async (parameter) => {
  try {
    const query = `
    INSERT INTO TB_DONOR 
    (DONOR_FNAME, DONOR_MNAME, DONOR_LNAME, DONOR_ADDRESS, DONOR_CITY, DONOR_STATE, 
     DONOR_COUNTRY, DONOR_PINCODE, DONOR_MOBILE, DONOR_EMAIL, DONOR_PAN, 
     DONOR_PROFESSION, DONOR_TYPE, CREATED_AT, UPDATED_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

  const replacements = [
    parameter.donorFName,
    parameter.donorMName || null,
    parameter.donorLName,
    parameter.donorAddress,
    parameter.donorCity,
    parameter.donorState,
    parameter.donorCountry,
    parameter.donorPinCode,
    parameter.donorMobile,
    parameter.donorEmail,
    parameter.donorPAN ,
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


exports.updateDonor = async (parameter) => {
    const fields = [];
    const replacements = [];
  
    // Mapping from parameter names to table column names
    const fieldMapping = {
      donorFName: "DONOR_FNAME",
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
  
    // Loop through each field in the mapping
    Object.keys(fieldMapping).forEach((key) => {
      if (parameter[key] !== undefined && parameter[key] !== null) {
        fields.push(`${fieldMapping[key]} = ?`);
        replacements.push(parameter[key]);
      }
    });
    console.log("fields - ", fields);
    if (fields.length === 0) {
      throw new Error("No valid fields provided for update.");
    }
  
    // Add the donorID as the last parameter for WHERE clause
    replacements.push(parameter.donorID);
    console.log("replacements - ", replacements);
    const query = `
      UPDATE TB_DONOR 
      SET ${fields.join(", ")}, UPDATED_AT = NOW() 
      WHERE DONOR_ID = ?`;
    console.log("query", query);
    const result = await sequelize.query(query, { replacements, type: QueryTypes.UPDATE });
    return result[1] > 0; // Returns true if at least one row was updated
  };
  
  

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
