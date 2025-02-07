const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Insert a new lead
exports.createLead = async (parameter) => {
  const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");
  const query = `
    INSERT INTO TB_LEADS 
    (PERSON_FNAME, PERSON_LNAME, NGO_NAME, CONTACT_NUMBER, EMAIL_ID, PREFERRED_CONTACT_TIME, CREATED_AT, UPDATED_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const replacements = [
    parameter.personFName,
    parameter.personLName,
    parameter.ngoName,
    parameter.contactNumber,
    parameter.emailID,
    parameter.preferredContactTime,
    currentTime,
    currentTime,
  ];

  await sequelize.query(query, { replacements, type: QueryTypes.INSERT });
};

// Update an existing lead
exports.updateLead = async (parameter) => {
  const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");
  const query = `
    UPDATE TB_LEADS 
    SET PERSON_FNAME = ?, PERSON_LNAME = ?, NGO_NAME = ?, CONTACT_NUMBER = ?, EMAIL_ID = ?, 
        PREFERRED_CONTACT_TIME = ?, CONVERSION_STATUS = ?, UPDATED_AT = ? 
    WHERE LEAD_ID = ? AND NGO_ID = ?
  `;
  const replacements = [
    parameter.personFName,
    parameter.personLName,
    parameter.ngoName,
    parameter.contactNumber,
    parameter.emailID,
    parameter.preferredContactTime,
    parameter.conversionStatus,
    currentTime,
    parameter.leadID,
    parameter.ngoID,
  ];

  await sequelize.query(query, { replacements, type: QueryTypes.UPDATE });
};
