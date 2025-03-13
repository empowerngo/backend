const {
  sequelize,
  QueryTypes
} = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Insert a new purpose
exports.createPurpose = async parameter => {
  const query = `
    INSERT INTO TB_NGO_PURPOSE (NGO_ID, PROJECT_ID, PURPOSE_NAME, CREATED_BY)
    VALUES (?, ?, ?, ?)
  `;
  const result = await sequelize.query(query, {
    replacements: [
      parameter.ngoID,
      parameter.projectID,
      parameter.purposeName,
      parameter.createdBy
    ],
    type: QueryTypes.INSERT
  });

  return {
    status: true,
    statusCode: 201,
    message: "Purpose created successfully.",
    payload: { purposeID: result[0] }
  };
};

// Update an existing purpose
exports.updatePurpose = async parameter => {
  const query = `
    UPDATE TB_NGO_PURPOSE 
    SET PURPOSE_NAME = ?, UPDATED_DATE = NOW()
    WHERE PURPOSE_ID = ? AND NGO_ID = ? AND PROJECT_ID = ?;
  `;
  const result = await sequelize.query(query, {
    replacements: [
      parameter.purposeName,
      parameter.purposeID,
      parameter.ngoID,
      parameter.projectID
    ],
    type: QueryTypes.UPDATE
  });

  return result[1] > 0
    ? {
        status: true,
        statusCode: 200,
        message: "Purpose updated successfully."
      }
    : {
        status: false,
        statusCode: 404,
        message: "Purpose not found or no changes made."
      };
};

// Retrieve purposes for a project
exports.getPurposes = async (ngoID, projectID) => {
  const query = `
    select B.PROJECT_ID,A.PURPOSE_ID, B.NGO_ID, B.PROJECT_NAME, A.PURPOSE_NAME, B.CREATED_DATE, B.UPDATED_DATE, 
B.CREATED_BY  from TB_NGO_PURPOSE A, TB_NGO_PROJECTS B
where A.PROJECT_ID = B.PROJECT_ID
and B.NGO_ID = ? order by 1;
  `;
  const result = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT
  });

  return {
    status: true,
    statusCode: 200,
    message: "Purposes retrieved successfully.",
    payload: result
  };
};
