const {
  sequelize,
  QueryTypes
} = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Function to fetch dashboard data for Super Admin
exports.fetchSuperAdminData = async (startYear, endYear) => {
  const activeNGOsCountQuery = `
    SELECT COUNT(DISTINCT B.NGO_ID) AS ActiveNGOsCount
    FROM TB_NGO_SUBSCRIPTION A JOIN TB_NGO B ON A.NGO_ID = B.NGO_ID
    WHERE A.SP_END_DATE >= NOW();
  `;

  const expiringNGOsQuery = `
    SELECT B.NGO_NAME, B.NGO_CONTACT, B.CONTACT_PERSON, A.SP_END_DATE AS EXPIRY_DATE
    FROM TB_NGO_SUBSCRIPTION A JOIN TB_NGO B ON A.NGO_ID = B.NGO_ID
    WHERE A.SP_END_DATE BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY);
  `;

  const expiredNGOsQuery = `
    SELECT B.NGO_NAME, B.NGO_CONTACT, B.CONTACT_PERSON, A.SP_END_DATE AS EXPIRY_DATE
    FROM TB_NGO_SUBSCRIPTION A JOIN TB_NGO B ON A.NGO_ID = B.NGO_ID
    WHERE A.SP_END_DATE BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW();
  `;

  const receiptLimitNGOsQuery = `
    SELECT COUNT(*) AS RECEIPT_COUNT, C.NUMBER_OF_DONATIONS, D.NGO_NAME, D.NGO_CONTACT, D.CONTACT_PERSON
FROM TB_DONATION A
JOIN TB_NGO_SUBSCRIPTION B ON A.NGO_ID = B.NGO_ID
JOIN TB_SUBS_PLANS C ON B.SP_PLANID = C.PLAN_ID
JOIN TB_NGO D ON A.NGO_ID = D.NGO_ID
WHERE ((MONTH(A.DONATION_DATE) >= 4 AND YEAR(A.DONATION_DATE) = ?)
        OR (MONTH(A.DONATION_DATE) <= 3 AND YEAR(A.DONATION_DATE) = ?))
GROUP BY C.NUMBER_OF_DONATIONS, D.NGO_NAME, D.NGO_CONTACT, D.CONTACT_PERSON 
HAVING C.NUMBER_OF_DONATIONS - COUNT(*) < 50;
  `;

  const [
    activeNGOs,
    expiringNGOs,
    expiredNGOs,
    receiptLimitNGOs
  ] = await Promise.all([
    sequelize.query(activeNGOsCountQuery, { type: QueryTypes.SELECT }),
    sequelize.query(expiringNGOsQuery, { type: QueryTypes.SELECT }),
    sequelize.query(expiredNGOsQuery, { type: QueryTypes.SELECT }),
    sequelize.query(receiptLimitNGOsQuery, {
      replacements: [startYear, endYear],
      type: QueryTypes.SELECT
    })
  ]);

  return {
    activeNGOs,
    expiringNGOs,
    expiredNGOs,
    receiptLimitNGOs
  };
};

// Function to fetch dashboard data for NGO Admin
exports.fetchNGOAdminData = async (ngoID, startYear, endYear) => {
  const dailySummaryQuery = `
    SELECT
      SUM(CASE WHEN DATE(DONATION_DATE) = CURDATE() THEN AMOUNT ELSE 0 END) AS TodaySum,
      SUM(CASE WHEN YEAR(DONATION_DATE) = YEAR(CURDATE()) AND MONTH(DONATION_DATE) = MONTH(CURDATE()) 
        AND DONATION_DATE <= CURDATE() THEN AMOUNT ELSE 0 END) AS MonthToDateSum,
      SUM(CASE WHEN YEAR(DONATION_DATE) = YEAR(CURDATE()) 
        AND DONATION_DATE <= CURDATE() THEN AMOUNT ELSE 0 END) AS YearToDateSum
    FROM TB_DONATION
    WHERE NGO_ID = ? 
    AND (
      (MONTH(DONATION_DATE) >= 4 AND YEAR(DONATION_DATE) = ?)
      OR (MONTH(DONATION_DATE) <= 3 AND YEAR(DONATION_DATE) = ?)
    );
  `;

  const monthlySummaryQuery = `
    SELECT MONTH(DONATION_DATE) AS DonationMonth, SUM(AMOUNT) AS MonthlySum
    FROM TB_DONATION 
    WHERE NGO_ID = ?
    AND (
      (MONTH(DONATION_DATE) >= 4 AND YEAR(DONATION_DATE) = ?)
      OR (MONTH(DONATION_DATE) <= 3 AND YEAR(DONATION_DATE) = ?)
    )
    GROUP BY DonationMonth ORDER BY DonationMonth;
  `;

  const receiptCountQuery = `
    SELECT COUNT(*) AS RECEIPT_COUNT FROM TB_DONATION 
    WHERE (
      (MONTH(DONATION_DATE) >= 4 AND YEAR(DONATION_DATE) = ?)
      OR (MONTH(DONATION_DATE) <= 3 AND YEAR(DONATION_DATE) = ?)
    );
  `;

  const userCountQuery = `
    SELECT COUNT(*) AS USER_COUNT FROM TB_USER A, TB_NGO_USER_MAPPING B 
    WHERE A.USER_ID = B.USER_ID AND B.NGO_ID = ?;
  `;

  const donationSummaryQuery = `
    SELECT PROJECT, PURPOSE, SUM(AMOUNT) AS AMOUNT FROM TB_DONATION
    WHERE NGO_ID = ? GROUP BY PROJECT, PURPOSE ORDER BY PROJECT;
  `;

  const [
    dailySummary,
    monthlySummary,
    receiptCount,
    userCount,
    donationSummary
  ] = await Promise.all([
    sequelize.query(dailySummaryQuery, {
      replacements: [ngoID, startYear, endYear],
      type: QueryTypes.SELECT
    }),
    sequelize.query(monthlySummaryQuery, {
      replacements: [ngoID, startYear, endYear],
      type: QueryTypes.SELECT
    }),
    sequelize.query(receiptCountQuery, {
      replacements: [startYear, endYear],
      type: QueryTypes.SELECT
    }),
    sequelize.query(userCountQuery, {
      replacements: [ngoID],
      type: QueryTypes.SELECT
    }),
    sequelize.query(donationSummaryQuery, {
      replacements: [ngoID],
      type: QueryTypes.SELECT
    })
  ]);

  return {
    dailySummary,
    monthlySummary,
    receiptCount,
    userCount,
    donationSummary
  };
};
