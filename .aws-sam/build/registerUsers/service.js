const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");
const bcrypt = require("/opt/nodejs/node_modules/bcryptjs");


// Check if NGO has space for a new staff user
exports.checkUserLimit = async (ngoID) => {
  const result = await sequelize.query(
    "SELECT COUNT(*) as userCount, MAX_USERS FROM TB_NGO WHERE NGO_ID = ?",
    { replacements: [ngoID], type: QueryTypes.SELECT }
  );
  return result[0].userCount < result[0].MAX_USERS;
};

// Check if a USER already exists by Email or MOBILE
exports.checkExistingUser = async (userEmail, userMobile) => {
  console.log("############# Inside checkExistingUser###########3");
  const query = `
    SELECT USER_ID FROM TB_USER 
    WHERE EMAIL = ? OR CONTACT_NUMBER = ?;
  `;
  const result = await sequelize.query(query, {
    replacements: [userEmail, userMobile],
    type: QueryTypes.SELECT,
  });

  return result.length > 0 ? result[0].USER_ID : null;
};
// Create a new user
exports.createUser = async (parameter) => {
  const hashedPassword = await bcrypt.hash(parameter.password, 10);
  const query = `
    INSERT INTO TB_USER (FULL_NAME, EMAIL, CONTACT_NUMBER, PASSWORD_HASH, ROLE_CODE, CREATED_BY)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const result = await sequelize.query(query, {
    replacements: [
      parameter.fullName,
      parameter.email,
      parameter.contactNumber,
      hashedPassword,
      parameter.roleCode,
      parameter.createdBy,
    ],
    type: QueryTypes.INSERT,
  });
  return result[0]; // Returns the new user ID
};

// Link a user to an NGO
exports.linkUserToNGO = async (userID, ngoID) => {
  const query = "INSERT INTO TB_NGO_USER_MAPPING (USER_ID, NGO_ID) VALUES (?, ?)";
  await sequelize.query(query, { replacements: [userID, ngoID], type: QueryTypes.INSERT });
};
