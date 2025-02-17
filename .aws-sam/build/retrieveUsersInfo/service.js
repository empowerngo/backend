const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Fetch all users
exports.fetchUsersList = async () => {
  const query = `
    SELECT USER_ID, FNAME, LNAME, EMAIL, CONTACT_NUMBER, ROLE_CODE, CREATED_AT 
    FROM TB_USER;
  `;
  return await sequelize.query(query, { type: QueryTypes.SELECT });
};

// Fetch user by ID
exports.fetchUserInfo = async (userID) => {
  const query = `
    SELECT 
      U.USER_ID, U.FNAME, U.LNAME, U.EMAIL, U.CONTACT_NUMBER, U.ROLE_CODE, 
      U.CREATED_BY, U.CREATED_AT, U.UPDATED_AT, 
      N.NGO_ID, N.NGO_NAME 
    FROM TB_USER U
    LEFT JOIN TB_NGO_USER_MAPPING M ON U.USER_ID = M.USER_ID
    LEFT JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID
    WHERE U.USER_ID = ?;
  `;

  const result = await sequelize.query(query, {
    replacements: [userID],
    type: QueryTypes.SELECT,
  });

  return result.length > 0 ? result[0] : null;
};
