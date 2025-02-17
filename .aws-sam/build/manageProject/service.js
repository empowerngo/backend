const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Insert a new project
exports.createProject = async (parameter) => {
  const query = `
    INSERT INTO TB_NGO_PROJECTS (NGO_ID, PROJECT_NAME, CREATED_BY)
    VALUES (?, ?, ?)
  `;
  const result = await sequelize.query(query, {
    replacements: [parameter.ngoID, parameter.projectName, parameter.createdBy],
    type: QueryTypes.INSERT,
  });

  return {
    status: true,
    statusCode: 201,
    message: "Project created successfully.",
    payload: { projectID: result[0] },
  };
};

// Update an existing project
exports.updateProject = async (parameter) => {
  const query = `
    UPDATE TB_NGO_PROJECTS 
    SET PROJECT_NAME = ?, UPDATED_DATE = NOW()
    WHERE PROJECT_ID = ? AND NGO_ID = ?;
  `;
  const result = await sequelize.query(query, {
    replacements: [parameter.projectName, parameter.projectID, parameter.ngoID],
    type: QueryTypes.UPDATE,
  });

  return result[1] > 0
    ? { status: true, statusCode: 200, message: "Project updated successfully." }
    : { status: false, statusCode: 404, message: "Project not found or no changes made." };
};

// Retrieve projects for an NGO
exports.getProjects = async (ngoID) => {
  const query = `
    SELECT PROJECT_ID, PROJECT_NAME, CREATED_DATE, UPDATED_DATE 
    FROM TB_NGO_PROJECTS WHERE NGO_ID = ?;
  `;
  const result = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT,
  });

  return {
    status: true,
    statusCode: 200,
    message: "Projects retrieved successfully.",
    payload: result,
  };
};
