const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Fetch all donors
exports.fetchDonorsList = async () => {
  const query = `
    SELECT DONOR_ID, DONOR_FNAME, DONOR_LNAME, DONOR_EMAIL, DONOR_CONTACT, DONOR_TYPE, CREATED_AT 
    FROM TB_DONOR;
  `;
  return await sequelize.query(query, { type: QueryTypes.SELECT });
};

// Fetch donor by ID
exports.fetchDonorInfo = async (donorID) => {
  const query = `
    SELECT 
      D.DONOR_ID, D.DONOR_FNAME, D.DONOR_LNAME, D.DONOR_EMAIL, D.DONOR_CONTACT, D.DONOR_TYPE,
      D.CREATED_AT, D.UPDATED_AT, 
      N.NGO_ID, N.NGO_NAME
    FROM TB_DONOR D
    LEFT JOIN TB_NGO_DONOR_MAPPING M ON D.DONOR_ID = M.DONOR_ID
    LEFT JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID
    WHERE D.DONOR_ID = ?;
  `;

  const result = await sequelize.query(query, {
    replacements: [donorID],
    type: QueryTypes.SELECT,
  });

  return result.length > 0 ? result[0] : null;
};
