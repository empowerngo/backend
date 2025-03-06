const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Fetch all subscription plans
exports.fetchAllPlans = async () => {
  const query = `SELECT * FROM TB_SUBS_PLANS`;
  const plans = await sequelize.query(query, { type: QueryTypes.SELECT });

  return plans.map(plan => ({
    planID: plan.PLAN_ID,
    planName: plan.PLAN_NAME,
    planPrice: plan.PLAN_PRICE,
    numberOfUsers: plan.NUMBER_OF_USERS,
    numberOfDonors: plan.NUMBER_OF_DONORS,
    numberOfDonations: plan.NUMBER_OF_DONATIONS,
    form10BEReport: plan.FORM_10BE_REPORT,
    status: plan.STATUS,
  }));
};

// Fetch a subscription plan by ID
exports.fetchPlanById = async (planID) => {
  const query = `SELECT * FROM TB_SUBS_PLANS WHERE PLAN_ID = ?`;
  const result = await sequelize.query(query, { replacements: [planID], type: QueryTypes.SELECT });

  if (result.length === 0) return null;

  const plan = result[0];

  return {
    planID: plan.PLAN_ID,
    planName: plan.PLAN_NAME,
    planPrice: plan.PLAN_PRICE,
    numberOfUsers: plan.NUMBER_OF_USERS,
    numberOfDonors: plan.NUMBER_OF_DONORS,
    numberOfDonations: plan.NUMBER_OF_DONATIONS,
    form10BEReport: plan.FORM_10BE_REPORT,
    status: plan.STATUS,
  };
};

// // Fetch plans by status (ACTIVE/INACTIVE)
// exports.fetchPlansByStatus = async (PLAN_STATUS) => {
//   const query = `SELECT * FROM TB_SUBS_PLANS WHERE STATUS = ?`;
//   return await sequelize.query(query, { replacements: [PLAN_STATUS], type: QueryTypes.SELECT });
// };
