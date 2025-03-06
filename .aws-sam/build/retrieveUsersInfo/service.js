const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Fetch all users
exports.fetchAdminUsersList = async () => {
  const query = `
  SELECT 
  U.USER_ID, 
  CONCAT(U.FNAME, ' ', U.LNAME) AS NAME, 
  U.EMAIL, 
  U.CONTACT_NUMBER, 
  U.ROLE_CODE,
  CASE 
      WHEN U.ROLE_CODE = 1 THEN 'Super Admin'
      WHEN U.ROLE_CODE = 2 THEN 'NGO Admin'
      WHEN U.ROLE_CODE = 3 THEN 'NGO User'
      WHEN U.ROLE_CODE = 4 THEN 'NGO CA'
      ELSE 'Unknown Role'
  END AS ROLE_NAME,
  U.CREATED_BY,
  CONCAT(CU.FNAME, ' ', CU.LNAME) AS CREATED_BY_NAME,
  GROUP_CONCAT(DISTINCT N.NGO_ID) AS NGO_IDS, 
  GROUP_CONCAT(DISTINCT N.NGO_NAME) AS NGO_NAMES , U.USER_STATUS
FROM TB_USER U
LEFT JOIN TB_NGO_USER_MAPPING M ON U.USER_ID = M.USER_ID
LEFT JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID
LEFT JOIN TB_USER CU ON U.CREATED_BY = CU.USER_ID  -- Self-join to get creator's name
GROUP BY U.USER_ID, U.FNAME, U.LNAME, U.EMAIL, U.CONTACT_NUMBER, U.ROLE_CODE, U.CREATED_BY, CU.FNAME, CU.LNAME;

  `;
  return await sequelize.query(query, { type: QueryTypes.SELECT });
};

exports.fetchNGOUserList = async (ngoID) => {
  const query = `
  SELECT
    U.USER_ID,
    CONCAT(U.FNAME, ' ', U.LNAME) AS NAME,
    U.EMAIL,
    U.CONTACT_NUMBER,
    U.ROLE_CODE,
    CASE
        WHEN U.ROLE_CODE = 2 THEN 'NGO Admin'
        WHEN U.ROLE_CODE = 3 THEN 'NGO User'
        WHEN U.ROLE_CODE = 4 THEN 'NGO CA'
        ELSE 'Unknown Role'
    END AS ROLE_NAME,
    U.CREATED_BY,
    CONCAT(CU.FNAME, ' ', CU.LNAME) AS CREATED_BY_NAME,
    GROUP_CONCAT(DISTINCT N.NGO_ID) AS NGO_IDS,
    GROUP_CONCAT(DISTINCT N.NGO_NAME) AS NGO_NAMES,
    U.USER_STATUS
FROM TB_USER U
INNER JOIN TB_NGO_USER_MAPPING M ON U.USER_ID = M.USER_ID  -- Changed to INNER JOIN
INNER JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID                  -- Changed to INNER JOIN
LEFT JOIN TB_USER CU ON U.CREATED_BY = CU.USER_ID
WHERE U.ROLE_CODE IN (3, 4)
  AND N.NGO_ID = ?
GROUP BY U.USER_ID, U.FNAME, U.LNAME, U.EMAIL, U.CONTACT_NUMBER, U.ROLE_CODE, U.CREATED_BY, CU.FNAME, CU.LNAME;`;
const result = await sequelize.query(query, {
  replacements: [ngoID],
  type: QueryTypes.SELECT,
});

return result;
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
