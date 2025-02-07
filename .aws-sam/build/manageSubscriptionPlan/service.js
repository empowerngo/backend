const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Retrieve all subscription plans
exports.getPlans = async () => {
  const query = "SELECT * FROM TB_SUBS_PLANS WHERE PLAN_STATUS = 'Active'";
  return await sequelize.query(query, { type: QueryTypes.SELECT });
};

// Create a new subscription plan
exports.createPlan = async (parameter) => {
  const query = `
    INSERT INTO TB_SUBS_PLANS 
    (PLAN_NAME, PLAN_PRICE, PLAN_STATUS, NUMBER_OF_USERS, NUMBER_OF_DONORS, NUMBER_OF_DONATIONS, FORM_10BE_REPORT, CREATED_AT, UPDATED_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const replacements = [
    parameter.planName,
    parameter.planPrice,
    parameter.planStatus,
    parameter.numberOfUsers,
    parameter.numberOfDonors,
    parameter.numberOfDonations,
    parameter.form10BEReport,
  ];

  const result = await sequelize.query(query, { replacements, type: QueryTypes.INSERT });
  return result[0]; // Returns the new plan ID
};

// Update an existing subscription plan
exports.updatePlan = async (parameter) => {
  const query = `
    UPDATE TB_SUBS_PLANS 
    SET 
      PLAN_NAME = COALESCE(?, PLAN_NAME), 
      PLAN_PRICE = COALESCE(?, PLAN_PRICE), 
      PLAN_STATUS = COALESCE(?, PLAN_STATUS), 
      NUMBER_OF_USERS = COALESCE(?, NUMBER_OF_USERS), 
      NUMBER_OF_DONORS = COALESCE(?, NUMBER_OF_DONORS), 
      NUMBER_OF_DONATIONS = COALESCE(?, NUMBER_OF_DONATIONS), 
      FORM_10BE_REPORT = COALESCE(?, FORM_10BE_REPORT),
      UPDATED_AT = NOW()
    WHERE PLAN_ID = ?
  `;

  const replacements = [
    parameter.planName || null,
    parameter.planPrice || null,
    parameter.planStatus || null,
    parameter.numberOfUsers || null,
    parameter.numberOfDonors || null,
    parameter.numberOfDonations || null,
    parameter.form10BEReport || null,
    parameter.planID,
  ];

  await sequelize.query(query, { replacements, type: QueryTypes.UPDATE });
};
