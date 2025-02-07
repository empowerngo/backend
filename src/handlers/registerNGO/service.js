const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Check if an NGO already exists by Email or PAN
exports.checkExistingNGO = async (ngoEmail, ngoPAN) => {
  const query = `
    SELECT NGO_ID FROM TB_NGO 
    WHERE NGO_EMAIL = ? OR NGO_PAN = ?
  `;
  const result = await sequelize.query(query, {
    replacements: [ngoEmail, ngoPAN],
    type: QueryTypes.SELECT,
  });

  return result.length > 0 ? result[0].NGO_ID : null;
};

// Register a new NGO
exports.registerNGO = async (parameter) => {
  const query = `
    INSERT INTO TB_NGO 
    (NGO_NAME, NGO_ADDRESS, NGO_CITY, NGO_STATE, NGO_COUNTRY, NGO_PINCODE, NGO_EMAIL, NGO_CONTACT, 
     NGO_80G_NUMBER, NGO_12A_NUMBER, NGO_CSR_NUMBER, NGO_FCRA_NUMBER, NGO_PAN, CONTACT_PERSON, NGO_REG_NUMBER, CREATED_AT, UPDATED_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  
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
  ];

  const result = await sequelize.query(query, { replacements, type: QueryTypes.INSERT });
  return result[0]; // Returns the newly inserted NGO ID
};
