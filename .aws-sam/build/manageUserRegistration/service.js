const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");
const bcrypt = require("/opt/nodejs/node_modules/bcryptjs");

// Check if a USER already exists by Email or Mobile
// exports.checkExistingUser = async (userEmail, userMobile) => {
//   const query = `
//     SELECT USER_ID FROM TB_USER 
//     WHERE EMAIL = ? OR CONTACT_NUMBER = ?;
//   `;
//   const result = await sequelize.query(query, {
//     replacements: [userEmail, userMobile],
//     type: QueryTypes.SELECT,
//   });
//   return result.length > 0 ? result[0].USER_ID : null;
// };

// ✅ Check if user exists (now also returns USER_STATUS)
exports.checkExistingUser = async (email, contactNumber) => {
  const query = `SELECT USER_ID, ROLE_CODE, USER_STATUS FROM TB_USER WHERE EMAIL = ? OR CONTACT_NUMBER = ? LIMIT 1;`;
  const result = await sequelize.query(query, { replacements: [email, contactNumber], type: QueryTypes.SELECT });
  return result.length > 0 ? result[0] : null;
};

// Get existing CA user (if already registered)
exports.getExistingCA = async (userContact) => {
  const query = `SELECT USER_ID FROM TB_USER WHERE CONTACT_NUMBER = ? AND ROLE_CODE = 4;`;
  const result = await sequelize.query(query, {
    replacements: [userContact],
    type: QueryTypes.SELECT,
  });
  return result.length > 0 ? result[0].USER_ID : null;
};


// ✅ Create a new user (USER_STATUS set to 'ACTIVE' by default)
exports.createUser = async (parameter) => {
  const hashedPassword = await bcrypt.hash(parameter.password, 10);
  const query = `
    INSERT INTO TB_USER (FNAME, LNAME, EMAIL, CONTACT_NUMBER, PASSWORD_HASH, ROLE_CODE, CREATED_BY, USER_STATUS)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
  `;
  const result = await sequelize.query(query, {
    replacements: [
      parameter.firstName,
      parameter.lastName,
      parameter.email,
      parameter.contactNumber,
      hashedPassword,
      parameter.roleCode,
      parameter.userID,
    ],
    type: QueryTypes.INSERT,
  });

  return result[0]; // Return the newly created user ID
};


// Link a user to an NGO
exports.linkUserToNGO = async (userID, ngoID) => {
  console.log("###########Inside linkUserToNGO###########");
  const query = "INSERT INTO TB_NGO_USER_MAPPING (USER_ID, NGO_ID) VALUES (?, ?)";
  console.log("query ===", query);
  await sequelize.query(query, { replacements: [userID, ngoID], type: QueryTypes.INSERT });
};

// Check if user is already linked to an NGO
exports.checkUserNGOLink = async (userID) => {
  const query = `SELECT IF(EXISTS (SELECT 1 FROM TB_NGO_USER_MAPPING WHERE USER_ID = ? LIMIT 1), TRUE, FALSE) AS isLinked;`;
  const result = await sequelize.query(query, { replacements: [userID], type: QueryTypes.SELECT });
  return result.length > 0;
};

// Update user status
exports.updateUserStatus = async (userID, status) => {
  const query = `UPDATE TB_USER SET USER_STATUS = ? WHERE USER_ID = ?;`;
  const result = await sequelize.query(query, { replacements: [status, userID], type: QueryTypes.UPDATE });

  console.error("result : ", result);  // Debugging
  return result[1] > 0;  // Check the second element for affected rows
};


// ✅ Retrieve user details (now also returns USER_STATUS)
exports.getUserDetails = async (userID) => {
  const query = `SELECT USER_ID, FNAME, LNAME, EMAIL, ROLE_CODE, USER_STATUS FROM TB_USER WHERE USER_ID = ? LIMIT 1;`;
  const result = await sequelize.query(query, { replacements: [userID], type: QueryTypes.SELECT });
  return result.length > 0 ? result[0] : null;
};
