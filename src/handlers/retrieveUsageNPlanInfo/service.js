const {
  sequelize,
  QueryTypes,
} = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Function to fetch dashboard data for Super Admin
exports.fetchUsageNPlanInfo = async (ngoID) => {
  const today = new Date();
  const todayDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Determine startYear and endYear based on fiscal year logic
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // getMonth() is zero-based

  let startYear, endYear;
  if (month >= 4) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }
  console.log("startYear = ", startYear);
  console.log("startYear = ", endYear);

  
  const receiptCountQuery = `
    SELECT COUNT(*) AS RECEIPT_COUNT FROM TB_DONATION 
    WHERE (
      (MONTH(DONATION_DATE) >= 4 AND YEAR(DONATION_DATE) =   ?)
      OR (MONTH(DONATION_DATE) <= 3 AND YEAR(DONATION_DATE) = ?)
    ) and NGO_ID = ?;
  `;

  const userCountQuery = `
    SELECT COUNT(*) AS USER_COUNT FROM TB_USER A, TB_NGO_USER_MAPPING B 
    WHERE A.USER_ID = B.USER_ID AND B.NGO_ID = ? AND A.USER_STATUS = "ACTIVE";
  `;

  const getNgoSubscriptionPlan = `
      SELECT A.PLAN_ID, A.PLAN_NAME, A.PLAN_PRICE, A.VALIDITY, A.PLAN_STATUS, 
      A.NUMBER_OF_USERS, A.NUMBER_OF_DONATIONS, A.FORM_10BD_DATA, A.FORM_10BE_MAIL,
      A.CA_ACCESS, B.SP_END_DATE, B.SP_END_DATE 
      FROM TB_SUBS_PLANS A, TB_NGO_SUBSCRIPTION B 
      WHERE A.PLAN_ID = B.SP_PLANID
      and NGO_ID = ? ;
    `;

  const [ngoPlan, receiptCount, userCount] = await Promise.all([
    sequelize.query(getNgoSubscriptionPlan, {
      replacements: [ngoID],
      type: QueryTypes.SELECT,
    }),
    sequelize.query(receiptCountQuery, {
      replacements: [startYear, endYear,ngoID],
      type: QueryTypes.SELECT,
    }),
    sequelize.query(userCountQuery, {
      replacements: [ngoID],
      type: QueryTypes.SELECT,
    }),
  ]);

  return {
    ngoPlan,
    receiptCount,
    userCount,
  };
};
