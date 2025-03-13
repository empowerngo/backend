// service.js
const {
  sequelize,
  QueryTypes
} = require("/opt/nodejs/utils/SequelizeWriteConnection");

exports.checkExistingNGO = async (ngoEmail, ngoPAN) => {
  const query = `SELECT NGO_ID FROM TB_NGO WHERE NGO_EMAIL = ? OR NGO_PAN = ?`;
  const result = await sequelize.query(query, {
    replacements: [ngoEmail, ngoPAN],
    type: QueryTypes.SELECT
  });
  return result.length > 0 ? result[0].NGO_ID : null;
};

exports.registerNGO = async parameter => {
  try {
    const query = `
    INSERT INTO TB_NGO 
    (NGO_NAME, NGO_ADDRESS, NGO_CITY, NGO_STATE, NGO_COUNTRY, NGO_PINCODE, NGO_EMAIL, NGO_CONTACT, 
     NGO_80G_NUMBER, NGO_12A_NUMBER, NGO_CSR_NUMBER, NGO_FCRA_NUMBER, NGO_PAN, CONTACT_PERSON, NGO_REG_NUMBER, 
     AUTHORIZED_PERSON,LOGO_URL, SIGNATURE_URL,SEAL_URL , CREATED_AT, REG80G_DATE,UPDATED_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?, NOW(), NOW())`;

    const replacements = [
      parameter.ngoName,
      parameter.ngoAddress,
      parameter.ngoCity,
      parameter.ngoState,
      parameter.ngoCountry,
      parameter.ngoPinCode,
      parameter.ngoEmail,
      parameter.ngoContact,
      parameter.ngo80GNumber,
      parameter.ngo12ANumber,
      parameter.ngoCSRNumber || null,
      parameter.ngoFCRANumber || null,
      parameter.ngoPAN,
      parameter.contactPerson,
      parameter.ngoRegNumber,
      parameter.authorizedPerson,
      parameter.logoURL || null,
      parameter.signatureURL || null,
      parameter.ngoSealURL || null,
      parameter.reg80GDate || null
    ];

    const result = await sequelize.query(query, {
      replacements,
      type: QueryTypes.INSERT
    });
    const ngoID = result[0]; // Correctly retrieves the NGO_ID

    // Ensure planID is provided before calling addNgoSubscription
    if (!parameter.planID) {
      throw new Error("Plan ID is required to register NGO.");
    }

    // Call addNgoSubscription within the same try block for better error handling
    await exports.addNgoSubscription(ngoID, parameter.planID);

    return ngoID; // Return ngoID directly
  } catch (error) {
    console.error("Error registering NGO:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

exports.updateNGO = async parameter => {
  const fields = [];
  const replacements = [];

  // Mapping the field names to match with table columns
  const fieldMapping = {
    ngoName: "NGO_NAME",
    ngoAddress: "NGO_ADDRESS",
    ngoCity: "NGO_CITY",
    ngoState: "NGO_STATE",
    ngoCountry: "NGO_COUNTRY",
    ngoPinCode: "NGO_PINCODE",
    ngoEmail: "NGO_EMAIL",
    ngoContact: "NGO_CONTACT",
    ngo80GNumber: "NGO_80G_NUMBER",
    ngo12ANumber: "NGO_12A_NUMBER",
    ngoCSRNumber: "NGO_CSR_NUMBER",
    ngoFCRANumber: "NGO_FCRA_NUMBER",
    ngoPAN: "NGO_PAN",
    contactPerson: "CONTACT_PERSON",
    authorizedPerson: "AUTHORIZED_PERSON",
    ngoRegNumber: "NGO_REG_NUMBER",
    logoURL: "LOGO_URL",
    signatureURL: "SIGNATURE_URL",
    ngoSealURL: "SEAL_URL",
    reg80GDate:"REG80G_DATE"
  };

  // Loop through the fieldMapping and check if any fields are present in the parameter
  Object.keys(fieldMapping).forEach(key => {
    if (parameter[key] !== undefined && parameter[key] !== null) {
      fields.push(`${fieldMapping[key]} = ?`);
      replacements.push(parameter[key]);
    }
  });

  // If no valid fields are provided for update, return false
  if (fields.length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  // Add ngoID for WHERE condition
  replacements.push(parameter.ngoID);

  // Build the query
  const query = `
    UPDATE TB_NGO 
    SET ${fields.join(", ")}, UPDATED_AT = NOW() 
    WHERE NGO_ID = ?`;

  // Execute the query
  const result = await sequelize.query(query, {
    replacements,
    type: QueryTypes.UPDATE
  });

  // Return true if the update was successful (at least one row affected)
  return result[1] > 0;
};

exports.addNgoSubscription = async (ngoId, planId) => {
  try {
    // Check for an existing active subscription
    const activeSubscription = await sequelize.query(
      "SELECT * FROM TB_NGO_SUBSCRIPTION WHERE NGO_ID = :ngoId AND SP_STATUS = 'Active'",
      { replacements: { ngoId }, type: QueryTypes.SELECT }
    );

    if (activeSubscription && activeSubscription.length > 0) {
      throw new Error("An active subscription already exists for this NGO.");
    }

    // Get plan validity
    const planDetails = await sequelize.query(
      "SELECT VALIDITY FROM TB_SUBS_PLANS WHERE PLAN_ID = :planId",
      { replacements: { planId }, type: QueryTypes.SELECT }
    );

    if (!planDetails || planDetails.length === 0) {
      throw new Error("Plan not found.");
    }

    // const validityMonths = planDetails[0].VALIDITY;
    // const endDate = new Date(subDate);
    // endDate.setMonth(endDate.getMonth() + validityMonths);

    const validityMonths = planDetails[0].VALIDITY;
    console.log("validityMonths - ", validityMonths);
    
    const endDate = new Date(); // Create a new Date object from subDate to avoid modifying the original
    endDate.setMonth(endDate.getMonth() + validityMonths);
    console.log("endDate - ", endDate);
  

    const query = `
          INSERT INTO TB_NGO_SUBSCRIPTION (NGO_ID, SP_PLANID, SP_END_DATE)
          VALUES (:ngoId, :planId, :endDate)`;

    const replacements = {
      ngoId,
      planId,
      endDate
    };

    const result = await sequelize.query(query, {
      replacements,
      type: QueryTypes.INSERT
    });

    return result[0]; // Return the inserted ID
  } catch (error) {
    console.error("Error adding NGO subscription:", error);
    throw error;
  }
};
