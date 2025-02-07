const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Generate sequential receipt number per NGO
exports.generateReceiptNumber = async (ngoID) => {
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

  return `${ngoID}-${result[0].LAST_RECEIPT_NUMBER}`;
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
    SET AMOUNT = ?, BANK = ?, TYPE = ?, TRANSACTION_ID = ?, PURPOSE = ?, PROJECT = ?, DONATION_DATE = ?, NOTE = ?, UPDATED_AT = NOW()
    WHERE DONATION_ID = ? AND NGO_ID = ?
  `;

  await sequelize.query(query, {
    replacements: [
      parameter.amount,
      parameter.bank,
      parameter.type,
      parameter.transactionID || null,
      parameter.purpose,
      parameter.project || null,
      parameter.donationDate,
      parameter.note || null,
      parameter.donationID,
      parameter.ngoID,
    ],
    type: QueryTypes.UPDATE,
  });
};
