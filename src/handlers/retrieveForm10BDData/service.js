const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");
const { Parser } = require('/opt/nodejs/node_modules/json2csv');
const { decrypt } = require("/opt/nodejs/utils/cryptohelper.js"); // Assuming only decrypt is needed

exports.fetchForm10BDData = async (ngoID, startDate, endDate, ngo80GNumber, reg80GDate) => {
  const query = `
    SELECT
      d.DONOR_ID,
      t.DONOR_FNAME,
      t.DONOR_MNAME,
      t.DONOR_LNAME,
      CONCAT_WS(', ', t.DONOR_ADDRESS, t.DONOR_CITY, t.DONOR_STATE, t.DONOR_COUNTRY, t.DONOR_PINCODE) AS DONOR_ADDRESS,
      t.DONOR_MOBILE,
      t.DONOR_PAN,
      SUM(d.AMOUNT) AS TOTAL_DONATION,
      d.PURPOSE AS DONATION_TYPE,
      d.TYPE
    FROM
      TB_DONATION d
    JOIN
      TB_DONOR t ON d.DONOR_ID = t.DONOR_ID
    WHERE
      d.DONATION_DATE BETWEEN ? AND ?
      AND d.NGO_ID = ?
      AND (t.DONOR_PAN IS NOT NULL AND t.DONOR_PAN != 'NA' AND t.DONOR_PAN != '')
    GROUP BY
      d.DONOR_ID, t.DONOR_FNAME, t.DONOR_MNAME, t.DONOR_LNAME, t.DONOR_PAN, t.DONOR_MOBILE, DONOR_ADDRESS, d.PURPOSE, d.TYPE
    ORDER BY
      d.DONOR_ID ASC;
  `;

  try {
    const result = await sequelize.query(query, {
      replacements: [startDate, endDate, ngoID],
      type: QueryTypes.SELECT,
    });

    if (!result || result.length === 0) {
      return null;
    }

    const decryptedResult = result.map((row) => {
      const decryptedRow = { ...row }; // Create a copy of the row
      decryptedRow.DONOR_FNAME = decrypt(row.DONOR_FNAME);
      decryptedRow.DONOR_MNAME = decrypt(row.DONOR_MNAME);
      decryptedRow.DONOR_LNAME = decrypt(row.DONOR_LNAME);
      decryptedRow.DONOR_MOBILE = decrypt(row.DONOR_MOBILE);
      decryptedRow.DONOR_PAN = decrypt(row.DONOR_PAN);
      decryptedRow.DONOR_NAME = `${decryptedRow.DONOR_FNAME} ${decryptedRow.DONOR_MNAME || ''} ${decryptedRow.DONOR_LNAME || ''}`.trim();
      return decryptedRow;
    });

    const mappingQuery = `SELECT CSV_COLUMNS, DATA_MAPPING, METHOD FROM TB_FORM10BD_REF ORDER BY ID`;
    const mappings = await sequelize.query(mappingQuery, {
      type: QueryTypes.SELECT,
    });

    const csvColumns = mappings.map((mapping) => mapping.CSV_COLUMNS);
    const dataMappings = mappings.map((mapping) => mapping.DATA_MAPPING);
    const methods = mappings.map((mapping) => mapping.METHOD);

    const csvData = decryptedResult.map((row, index) => {
      const csvRow = {};
      for (let i = 0; i < csvColumns.length; i++) {
        if (methods[i] === 'STATIC') {
          if (csvColumns[i] === 'Sl. No.') {
            csvRow[csvColumns[i]] = index + 1;
          } else if (csvColumns[i] === 'Unique Registration Number (URN)') {
            csvRow[csvColumns[i]] = ngo80GNumber;
          } else if (csvColumns[i] === 'Date of Issuance of Unique Registration Number') {
            csvRow[csvColumns[i]] = reg80GDate;
          } else {
            csvRow[csvColumns[i]] = dataMappings[i];
          }
        } else if (methods[i] === 'DYNAMIC') {
          csvRow[csvColumns[i]] = row[dataMappings[i]];
        } else {
          csvRow[csvColumns[i]] = ''; // Handle unexpected METHOD values
        }
      }
      return csvRow;
    });

    const json2csvParser = new Parser({ fields: csvColumns });
    const csvString = json2csvParser.parse(csvData);

    return csvString;

  } catch (error) {
    console.error('Error fetching and generating CSV:', error);
    return null;
  }
};