const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Check if an NGO exists by ID
exports.getNGOById = async (ngoID) => {
  const query = "SELECT NGO_ID FROM TB_NGO WHERE NGO_ID = ?";
  const result = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT,
  });

  return result.length > 0 ? result[0] : null;
};

// Update an existing NGO
exports.updateNGO = async (parameter) => {
  const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  const query = `
    UPDATE TB_NGO 
    SET 
      NGO_NAME = COALESCE(?, NGO_NAME), 
      NGO_ADDRESS = COALESCE(?, NGO_ADDRESS), 
      NGO_CITY = COALESCE(?, NGO_CITY), 
      NGO_STATE = COALESCE(?, NGO_STATE), 
      NGO_COUNTRY = COALESCE(?, NGO_COUNTRY), 
      NGO_PINCODE = COALESCE(?, NGO_PINCODE), 
      NGO_EMAIL = COALESCE(?, NGO_EMAIL), 
      NGO_CONTACT = COALESCE(?, NGO_CONTACT), 
      NGO_80G_NUMBER = COALESCE(?, NGO_80G_NUMBER), 
      NGO_12A_NUMBER = COALESCE(?, NGO_12A_NUMBER), 
      NGO_CSR_NUMBER = COALESCE(?, NGO_CSR_NUMBER), 
      NGO_FCRA_NUMBER = COALESCE(?, NGO_FCRA_NUMBER), 
      NGO_PAN = COALESCE(?, NGO_PAN), 
      CONTACT_PERSON = COALESCE(?, CONTACT_PERSON), 
      NGO_REG_NUMBER = COALESCE(?, NGO_REG_NUMBER), 
      STATUS = COALESCE(?, STATUS), 
      UPDATED_AT = ?
    WHERE NGO_ID = ?
  `;

  const replacements = [
    parameter.ngoName || null,
    parameter.ngoAddress || null,
    parameter.ngoCity || null,
    parameter.ngoState || null,
    parameter.ngoCountry || null,
    parameter.ngoPinCode || null,
    parameter.ngoEmail || null,
    parameter.ngoContact || null,
    parameter.ngo80GNumber || null,
    parameter.ngo12ANumber || null,
    parameter.ngoCSRNumber || null,
    parameter.ngoFCRANumber || null,
    parameter.ngoPAN || null,
    parameter.contactPerson || null,
    parameter.ngoRegNumber || null,
    parameter.status || null,
    currentTime,
    parameter.ngoID,
  ];

  await sequelize.query(query, { replacements, type: QueryTypes.UPDATE });
};
