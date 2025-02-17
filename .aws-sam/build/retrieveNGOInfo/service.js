const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Fetch all NGOs
exports.fetchNGOList = async () => {
  const query = `
    SELECT NGO_ID, NGO_NAME, NGO_CITY, NGO_STATE, NGO_EMAIL, NGO_CONTACT, NGO_PAN, NGO_REG_NUMBER
    FROM TB_NGO;
  `;
  return await sequelize.query(query, { type: QueryTypes.SELECT });
};

// Fetch NGO by ID
exports.fetchNGOInfo = async (ngoID) => {
  const query = `
    SELECT 
      NGO_ID, NGO_NAME, NGO_ADDRESS, NGO_CITY, NGO_STATE, NGO_COUNTRY, NGO_PINCODE, 
      NGO_EMAIL, NGO_CONTACT, NGO_80G_NUMBER, NGO_12A_NUMBER, NGO_CSR_NUMBER, NGO_FCRA_NUMBER, 
      NGO_PAN, CONTACT_PERSON, NGO_REG_NUMBER, LOGO_URL, SIGNATURE_URL, AUTHORIZED_PERSON, 
      CREATED_AT, UPDATED_AT 
    FROM TB_NGO 
    WHERE NGO_ID = ?;
  `;

  const result = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT,
  });

  return result.length > 0 ? result[0] : null;
};
