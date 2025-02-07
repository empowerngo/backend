const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Insert a new donor
exports.createDonor = async (parameter) => {
  const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");
  const query = `
    INSERT INTO TB_DONOR 
    (DONOR_FNAME, DONOR_MNAME, DONOR_LNAME, DONOR_ADDRESS, DONOR_CITY, DONOR_STATE, DONOR_COUNTRY, 
     DONOR_PINCODE, DONOR_MOBILE, DONOR_EMAIL, DONOR_PAN, DONOR_PROFESSION, DONOR_NGOID, DONOR_TYPE, CREATED_AT, UPDATED_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const replacements = [
    parameter.donorFName,
    parameter.donorMName || null,
    parameter.donorLName,
    parameter.donorAddress,
    parameter.donorCity,
    parameter.donorState,
    parameter.donorCountry,
    parameter.donorPinCode,
    parameter.donorMobile,
    parameter.donorEmail,
    parameter.donorPAN || null,
    parameter.donorProfession || null,
    parameter.donorNGOID,
    parameter.donorType,
    currentTime,
    currentTime,
  ];

  await sequelize.query(query, { replacements, type: QueryTypes.INSERT });
};

// Update an existing donor
exports.updateDonor = async (parameter) => {
  const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");
  const query = `
    UPDATE TB_DONOR 
    SET DONOR_FNAME = ?, DONOR_MNAME = ?, DONOR_LNAME = ?, DONOR_ADDRESS = ?, DONOR_CITY = ?, 
        DONOR_STATE = ?, DONOR_COUNTRY = ?, DONOR_PINCODE = ?, DONOR_MOBILE = ?, DONOR_EMAIL = ?, 
        DONOR_PAN = ?, DONOR_PROFESSION = ?, DONOR_TYPE = ?, UPDATED_AT = ?
    WHERE DONOR_ID = ?
  `;
  const replacements = [
    parameter.donorFName,
    parameter.donorMName || null,
    parameter.donorLName,
    parameter.donorAddress,
    parameter.donorCity,
    parameter.donorState,
    parameter.donorCountry,
    parameter.donorPinCode,
    parameter.donorMobile,
    parameter.donorEmail,
    parameter.donorPAN || null,
    parameter.donorProfession || null,
    parameter.donorType,
    currentTime,
    parameter.donorID,
  ];

  await sequelize.query(query, { replacements, type: QueryTypes.UPDATE });
};
