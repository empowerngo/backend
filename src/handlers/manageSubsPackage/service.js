const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Create a subscription plan
exports.createPlan = async (parameter) => {
  const query = `
    INSERT INTO TB_SUBS_PLANS 
    (PLAN_NAME, PLAN_PRICE, VALIDITY, NUMBER_OF_USERS, NUMBER_OF_DONATIONS, 
    NO_OF_PROJECTS, FORM_10BD_DATA, FORM_10BE_MAIL, CA_ACCESS) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const replacements = [
    parameter.planName,
    parameter.planPrice,
    parameter.planValidity,
    parameter.numberOfUsers,    
    parameter.numberOfDonations,
    parameter.numberOfProjects,
    parameter.form10BdData ? 1 : 0,
    parameter.form10BEMail ? 1 : 0,
    parameter.caAccess ? 1 : 0,
  ];
  const result = await sequelize.query(query, { replacements, type: QueryTypes.INSERT });
  return result[0];
};

// Update an existing subscription plan
// exports.updatePlan = async (parameter) => {
//   const query = `
//     UPDATE TB_SUBS_PLANS 
//     SET PLAN_NAME = ?, PLAN_PRICE = ?, NUMBER_OF_USERS = ?, NUMBER_OF_DONORS = ?, NUMBER_OF_DONATIONS = ?, FORM_10BE_REPORT = ?, UPDATED_AT = NOW() 
//     WHERE PLAN_ID = ?`;
//   const replacements = [
//     parameter.planName,
//     parameter.planPrice,
//     parameter.numberOfUsers,
//     parameter.numberOfDonors,
//     parameter.numberOfDonations,
//     parameter.form10BEReport ? 1 : 0,
//     parameter.planID,
//   ];
//   const result = await sequelize.query(query, { replacements, type: QueryTypes.UPDATE });
//   return result[1] > 0;
// };

// Delete a subscription plan
exports.deletePlan = async (planID) => {
  const query = `DELETE FROM TB_SUBS_PLANS WHERE PLAN_ID = ?`;
  const result = await sequelize.query(query, { replacements: [planID], type: QueryTypes.DELETE });
  return result[1] > 0;
};

// Update subscription plan status
exports.updatePlanStatus = async (planID, status) => {
  const query = `UPDATE TB_SUBS_PLANS SET STATUS = ?, UPDATED_AT = NOW() WHERE PLAN_ID = ?`;
  const result = await sequelize.query(query, { replacements: [status, planID], type: QueryTypes.UPDATE });
  return result[1] > 0;
};
