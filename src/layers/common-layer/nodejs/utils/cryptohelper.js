const crypto = require("crypto");

// Encryption Configuration
const algorithm = "aes-256-cbc";
const secretKeyHex = "a1300c47752db2b797e43fb11fcdc56fba5a0cf28b63276d9d7b1adae354cdf2"; // 64 hex chars = 32 bytes
const ivHex = "ae666619f04450859bf4fe10991d1a54"; // 32 hex chars = 16 bytes

// Convert HEX keys to Buffers
const secretKey = Buffer.from(secretKeyHex, "hex");
const iv = Buffer.from(ivHex, "hex");

// Validate key lengths
if (secretKey.length !== 32) {
    throw new Error("Encryption Key must be 32 bytes (64 hex characters)");
}
if (iv.length !== 16) {
    throw new Error("IV must be 16 bytes (32 hex characters)");
}

// Function to Encrypt Data
exports.encrypt = (text) => {
    if (!text) return null;
    const stringText = text.toString();
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(stringText, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
};



exports.decrypt = (encryptedText) => {
    if (!encryptedText) return null;

    try {
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        let decrypted = decipher.update(encryptedText, "base64", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (error) {
        console.error("Decryption Error:", error.message);
        return null;
    }
};

