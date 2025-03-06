const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

exports.storeCSVData = async (csvData, ngoId, donationType) => {
  try {
    const query = `
      INSERT INTO TB_STATEMENT (TXN_DATE, TXN_DESC, TXN_ID, TXN_AMOUNT, CR_DATE, UPD_DATE, NGO_ID, STATUS, TYPE) 
      VALUES (?, ?, ?, ?, NOW(), NOW(), ?, 'PENDING', ?)`;

    for (const row of csvData) {
      // Directly use the txnDate string from the CSV data
      const txnDate = row.txnDate; // Assuming row.txnDate is in 'YYYY-MM-DD' format

      await sequelize.query(query, {
        replacements: [
          txnDate, // Use the date string directly
          row.description,
          row.transactionID,
          parseFloat(row.amount), // Convert amount to decimal
          ngoId,
          donationType
        ],
        type: QueryTypes.INSERT
      });
    }

    return { message: "CSV data inserted successfully" };
  } catch (error) {
    console.error("Error inserting CSV data:", error);
    throw error;
  }
};
