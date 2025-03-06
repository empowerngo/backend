const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Fetch all subscription plans
exports.fetcAllRecords = async (ngoID) => {
  const query = `select * from TB_STATEMENT where NGO_ID =? and STATUS = "PENDING";`;
  const record = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT,
  });

  return record.map(record => ({
    statementID: record.ID,
    donationDate: record.TXN_DATE,
    transactionID: record.TXN_DESC,
    amount: record.TXN_AMOUNT,
    donationType: record.TYPE,
    status: record.STATUS
     }));
};
