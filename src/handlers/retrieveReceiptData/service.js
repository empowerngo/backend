const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

exports.fetchReceiptData = async (DONATION_ID, DONOR_ID, NGO_ID) => {
  const query = `
      SELECT 
  TRIM(CONCAT(D.DONOR_FNAME, ' ', COALESCE(NULLIF(D.DONOR_MNAME, ''), ''), ' ', D.DONOR_LNAME)) AS DONOR_NAME,
  TRIM(CONCAT(
    COALESCE(NULLIF(D.DONOR_ADDRESS, ''), ''), 
    IF(D.DONOR_CITY != '', CONCAT(', ', D.DONOR_CITY), ''),
    IF(D.DONOR_STATE != '', CONCAT(', ', D.DONOR_STATE), ''),
    IF(D.DONOR_COUNTRY != '', CONCAT(', ', D.DONOR_COUNTRY), ''),
    IF(D.DONOR_PINCODE != '', CONCAT(' - ', D.DONOR_PINCODE), '')
  )) AS DONOR_ADDRESS,
  D.DONOR_MOBILE, D.DONOR_EMAIL, D.DONOR_PAN, D.DONOR_PROFESSION, D.DONOR_TYPE,  
  DN.RECEIPT_NUMBER, DN.AMOUNT, DN.BANK, DN.TYPE, DN.TRANSACTION_ID, DN.PURPOSE, DN.PROJECT, DN.DONATION_DATE, DN.NOTE,  
  N.NGO_NAME,
  TRIM(CONCAT(
    COALESCE(NULLIF(N.NGO_ADDRESS, ''), ''), 
    IF(N.NGO_CITY != '', CONCAT(', ', N.NGO_CITY), ''),
    IF(N.NGO_STATE != '', CONCAT(', ', N.NGO_STATE), ''),
    IF(N.NGO_COUNTRY != '', CONCAT(', ', N.NGO_COUNTRY), ''),
    IF(N.NGO_PINCODE != '', CONCAT(' - ', N.NGO_PINCODE), '')
  )) AS NGO_ADDRESS,
  
  N.NGO_EMAIL, N.NGO_CONTACT, N.NGO_80G_NUMBER, N.NGO_12A_NUMBER, N.NGO_CSR_NUMBER, 
  N.NGO_FCRA_NUMBER, N.NGO_PAN, N.CONTACT_PERSON, N.NGO_REG_NUMBER, N.STATUS, 
  N.LOGO_URL, N.SIGNATURE_URL, N.AUTHORIZED_PERSON

FROM TB_DONATION DN
JOIN TB_DONOR D ON DN.DONOR_ID = D.DONOR_ID
JOIN TB_NGO N ON DN.NGO_ID = N.NGO_ID
WHERE DN.DONATION_ID = ? AND D.DONOR_ID = ? AND N.NGO_ID = ?;
  `;

  const result = await sequelize.query(query, {
    replacements: [DONATION_ID, DONOR_ID, NGO_ID],
    type: QueryTypes.SELECT,
  });

  return result.length > 0 ? result[0] : null;
};
