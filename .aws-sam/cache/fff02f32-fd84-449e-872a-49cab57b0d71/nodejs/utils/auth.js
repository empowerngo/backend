const AWS = require("/opt/nodejs/node_modules/aws-sdk");
const jwt = require("/opt/nodejs/node_modules/jsonwebtoken");

const ssm = new AWS.SSM();
let cachedSecret = null; // To avoid multiple API calls

const getJWTSecret = async () => {
  if (cachedSecret) return cachedSecret; // Return cached value if available

  try {
    const param = await ssm.getParameter({
      Name: process.env.JWT_SECRET_PARAM, // Get the parameter name from env
      WithDecryption: true,
    }).promise();

    cachedSecret = param.Parameter.Value; // Cache the secret for future use
    return cachedSecret;
  } catch (error) {
    console.error("Error fetching JWT secret:", error);
    throw new Error("Failed to retrieve JWT secret.");
  }
};

// exports.verifyToken = async (token) => {
//   try {
//     if (token.startsWith("Bearer")) {
//       token = token.slice(7, token.length);
//     }
    
//     const secret = await getJWTSecret();
//     return jwt.verify(token, secret);
//   } catch (error) {
//     console.error("JWT verification failed:", error);
//     return null;
//   }
// };
exports.verifyToken = async (token) => {
  try {
    if (!token || typeof token !== "string") {
      console.error("Invalid token format:", token);
      return null;
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    const secret = await getJWTSecret();
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};
