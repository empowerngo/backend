const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");
const { encrypt, decrypt } = require("/opt/nodejs/utils/cryptohelper.js");

// Fetch all donations details
exports.fetcAllDonations = async (ngoID) => {
  const query = `select B.*, D.DONOR_FNAME, D.DONOR_MNAME, D.DONOR_LNAME, D.DONOR_MOBILE,  D.DONOR_PAN, 
TRIM(CONCAT(
    COALESCE(NULLIF(D.DONOR_ADDRESS, ''), ''), 
    IF(D.DONOR_CITY != '', CONCAT(', ', D.DONOR_CITY), ''),
    IF(D.DONOR_STATE != '', CONCAT(', ', D.DONOR_STATE), ''),
    IF(D.DONOR_COUNTRY != '', CONCAT(', ', D.DONOR_COUNTRY), ''),
    IF(D.DONOR_PINCODE != '', CONCAT(' - ', D.DONOR_PINCODE), '')
  )) AS DONOR_ADDRESS, D.DONOR_EMAIL
from TB_DONATION B, TB_DONOR D 
where B.DONOR_ID = D.DONOR_ID 
and B.NGO_ID = ? order by 1 desc; `;
  const record = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT,
  });

  return record.map(record => ({
    donorID: record.DONOR_ID,
    ngoID: record.NGO_ID,
    donationID: record.DONATION_ID,
    receiptNumber: record.RECEIPT_NUMBER,
    amount: record.AMOUNT,
    amountInWords: numberToWords(record.AMOUNT),
    bank: record.BANK,
    type: record.TYPE,
    transactionID: record.TRANSACTION_ID,
    purpose: record.PURPOSE,
    project: record.PROJECT,
    donationDate: record.DONATION_DATE,
    note: record.NOTE,
    crDate: record.CREATED_AT,
    upDate:record.UPDATED_AT,
    donorFName: decrypt(record.DONOR_FNAME),
    donorMName: record.DONOR_MNAME ? decrypt(record.DONOR_MNAME) : null,
    donorLName: decrypt(record.DONOR_LNAME),
    donorEmail: decrypt(record.DONOR_EMAIL),
    donorMobile: decrypt(record.DONOR_MOBILE),
    donorPAN: decrypt(record.DONOR_PAN),
    donorAddress: record.DONOR_ADDRESS,    
     }));
};


function numberToWords(num) {
  if (num === 0) return "Zero rupees";

  const belowTwenty = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const thousands = ["", "Thousand", "Lakh", "Crore"];

  function convertLessThanThousand(n) {
      if (n === 0) return "";
      if (n < 20) return belowTwenty[n] + " ";
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + belowTwenty[n % 10] : "") + " ";
      return belowTwenty[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "");
  }

  let numCopy = num; // Avoid modifying the input directly
  let parts = []; // Use let instead of const
  let place = 0;

  while (numCopy > 0) {
      let chunk = numCopy % (place === 1 ? 100 : 1000);
      if (chunk !== 0) {
          let chunkWords = convertLessThanThousand(chunk).trim();
          parts.push(chunkWords + (thousands[place] ? " " + thousands[place] : ""));
      }
      numCopy = Math.floor(numCopy / (place === 1 ? 100 : 1000));
      place++;
  }

  return parts.reverse().join(" ").trim() + " rupees";
}





