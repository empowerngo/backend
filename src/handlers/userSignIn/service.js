const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");
const bcrypt = require("/opt/nodejs/node_modules/bcryptjs");
const jwt = require("/opt/nodejs/node_modules/jsonwebtoken");
const AWS = require("/opt/nodejs/node_modules/aws-sdk");
const ssm = new AWS.SSM();

// Authenticate user
exports.authenticateUser = async (email, password) => {
  const query = `
    SELECT U.USER_ID, U.FULL_NAME, U.EMAIL, U.CONTACT_NUMBER, U.PASSWORD_HASH, U.ROLE_CODE, 
           N.NGO_ID, N.NGO_NAME, N.STATUS AS NGO_STATUS
    FROM TB_USER U
    LEFT JOIN TB_NGO_USER_MAPPING M ON U.USER_ID = M.USER_ID
    LEFT JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID
    WHERE U.EMAIL = ?
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