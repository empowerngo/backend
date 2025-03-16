const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Generate sequential receipt number per NGO
exports.generateReceiptNumber = async (ngoID, donationDate) => {
  const query = `
    INSERT INTO TB_RECEIPT_SEQUENCE (NGO_ID, LAST_RECEIPT_NUMBER)
    VALUES (?, 1)
    ON DUPLICATE KEY UPDATE LAST_RECEIPT_NUMBER = LAST_RECEIPT_NUMBER + 1;
  `;

  await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.INSERT,
  });

  // Fetch the updated receipt number
  const result = await sequelize.query(
    "SELECT LAST_RECEIPT_NUMBER FROM TB_RECEIPT_SEQUENCE WHERE NGO_ID = ?",
    { replacements: [ngoID], type: QueryTypes.SELECT }
  );

  // Convert donationDate to a Date object if it's a string
  const date = typeof donationDate === 'string' ? new Date(donationDate) : donationDate;

  if (!date || isNaN(date.getTime())) {
    throw new Error('Invalid donationDate provided.');
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are 0-indexed

  let finYear;

  if (month >= 4) {
    finYear = `${year.toString().slice(2)}${(year + 1).toString().slice(2)}`;
  } else {
    finYear = `${(year - 1).toString().slice(2)}${year.toString().slice(2)}`;
  }

  return `${finYear}-${result[0].LAST_RECEIPT_NUMBER}`;
};

// Insert donation into database
exports.createDonation = async (parameter, receiptNumber) => {
  const query = `
    INSERT INTO TB_DONATION 
    (DONOR_ID, NGO_ID, AMOUNT, BANK, TYPE, TRANSACTION_ID, PURPOSE, PROJECT, DONATION_DATE, NOTE, RECEIPT_NUMBER, CREATED_AT, UPDATED_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  await sequelize.query(query, {
    replacements: [
      parameter.donorID,
      parameter.ngoID,
      parameter.amount,
      parameter.bank,
      parameter.type,
      parameter.transactionID || null,
      parameter.purpose,
      parameter.project || null,
      parameter.donationDate,
      parameter.note || null,
      receiptNumber,
    ],
    type: QueryTypes.INSERT,
  });
};

// Update donation record
exports.updateDonation = async (parameter) => {
  const query = `
    UPDATE TB_DONATION 
    SET DONOR_ID = ?, AMOUNT = ?, BANK = ?, TYPE = ?, PURPOSE = ?, PROJECT = ?, NOTE = ?, UPDATED_AT = NOW()
    WHERE DONATION_ID = ? AND NGO_ID = ?
  `;

  await sequelize.query(query, {
    replacements: [
      parameter.donorID,
      parameter.amount,
      parameter.bank,
      parameter.type,
      parameter.purpose,
      parameter.project,
      parameter.note || null,
      parameter.donationID,
      parameter.ngoID,
    ],
    type: QueryTypes.UPDATE,
  });
};

// Update donation record
exports.updateStatement = async (statementID,ngoID ) => {
  const query = `
    UPDATE TB_STATEMENT 
    SET STATUS = "HANDLED", UPD_DATE = NOW()
    WHERE ID = ? AND NGO_ID = ?
  `;

  await sequelize.query(query, {
    replacements: [
      statementID,
      ngoID,      
    ],
    type: QueryTypes.UPDATE,
  });
};