const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");
const bcrypt = require("/opt/nodejs/node_modules/bcryptjs");
const jwt = require("/opt/nodejs/node_modules/jsonwebtoken");
const AWS = require("/opt/nodejs/node_modules/aws-sdk");
const ssm = new AWS.SSM();

// Authenticate user
exports.authenticateUser = async (email, password) => {
  const query = `
   SELECT U.USER_ID, U.FNAME, U.LNAME, U.EMAIL, U.CONTACT_NUMBER, U.PASSWORD_HASH, U.ROLE_CODE, 
           N.NGO_ID, N.NGO_NAME, N.STATUS AS NGO_STATUS, N.LOGO_URL, N.SIGNATURE_URL, 
           N.AUTHORIZED_PERSON, N.NGO_80G_NUMBER,  N.NGO_12A_NUMBER,  N.NGO_CSR_NUMBER,  N.NGO_FCRA_NUMBER,  
            N.NGO_PAN,  N.NGO_REG_NUMBER, 
            TRIM(CONCAT(
    COALESCE(NULLIF(N.NGO_ADDRESS, ''), ''), 
    IF(N.NGO_CITY != '', CONCAT(', ', N.NGO_CITY), ''),
    IF(N.NGO_STATE != '', CONCAT(', ', N.NGO_STATE), ''),
    IF(N.NGO_COUNTRY != '', CONCAT(', ', N.NGO_COUNTRY), ''),
    IF(N.NGO_PINCODE != '', CONCAT(' - ', N.NGO_PINCODE), '')
  )) AS NGO_ADDRESS
    FROM TB_USER U
    LEFT JOIN TB_NGO_USER_MAPPING M ON U.USER_ID = M.USER_ID
    LEFT JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID
    WHERE U.EMAIL = ?;
  `;

  const result = await sequelize.query(query, {
    replacements: [email],
    type: QueryTypes.SELECT,
  });

  if (result.length === 0) return null;

  const user = result[0];

  // Validate password
  const isValidPassword = await bcrypt.compare(password, user.PASSWORD_HASH);
  if (!isValidPassword) return null;

  // Remove password hash from response
  delete user.PASSWORD_HASH;

  // Fetch projects and purposes if user role is 2 or 3
  if (user.ROLE_CODE === 2 || user.ROLE_CODE === 3) {
    user.PROJECTS = await fetchProjectsAndPurposes(user.NGO_ID);
  }


  return user;
};

// Generate JWT Token
exports.generateToken = async (user) => {
  // Secret key for JWT
  // const JWT_SECRET_PARAM = process.env.JWT_SECRET_PARAM || "your_jwt_secret";
  const JWT_SECRET_PARAM = await getJWTSecret();
  const JWT_EXPIRY = "7d"; // Token validity of 7 days
  console.log("JWT_SECRET_PARAM :--", JWT_SECRET_PARAM);
  const payload = {
    userID: user.USER_ID,
    email: user.EMAIL,
    role: user.ROLE_CODE,
    ngoID: user.NGO_ID || null,
  };

  return jwt.sign(payload, JWT_SECRET_PARAM, { expiresIn: JWT_EXPIRY });
};

// Fetch JWT secret from SSM
const getJWTSecret = async () => {
  try {
    const data = await ssm
      .getParameter({
        Name: "/emp-backend/jwt-secret",
        WithDecryption: true, // Make sure the secret is decrypted
      })
      .promise();

    return data.Parameter.Value;
  } catch (error) {
    console.error("Error fetching JWT secret from SSM:", error);
    throw new Error("JWT secret not found");
  }
};

// Fetch projects and purposes based on NGO_ID
const fetchProjectsAndPurposes = async (ngoID) => {
  const query = `
    SELECT 
      P.PROJECT_ID, P.PROJECT_NAME, 
      PU.PURPOSE_ID, PU.PURPOSE_NAME
    FROM TB_NGO_PROJECTS P
    LEFT JOIN TB_NGO_PURPOSE PU ON P.PROJECT_ID = PU.PROJECT_ID 
    WHERE P.NGO_ID = ?;
  `;

  const results = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT,
  });

  // Transform data into a structured format
  const projectMap = {};
  results.forEach(row => {
    if (!projectMap[row.PROJECT_ID]) {
      projectMap[row.PROJECT_ID] = {
        PROJECT_ID: row.PROJECT_ID,
        PROJECT_NAME: row.PROJECT_NAME,
        PURPOSES: [],
      };
    }
    if (row.PURPOSE_ID) {
      projectMap[row.PROJECT_ID].PURPOSES.push({
        PURPOSE_ID: row.PURPOSE_ID,
        PURPOSE_NAME: row.PURPOSE_NAME,
      });
    }
  });

  return Object.values(projectMap);
};