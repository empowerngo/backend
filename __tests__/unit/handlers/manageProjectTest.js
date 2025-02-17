const service = require("../../../src/handlers/manageProject/service");
const manageProjects = require("../../../src/handlers/manageProject/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "createProject");
jest.spyOn(service, "updateProject");
jest.spyOn(service, "getProjects");

describe("Manage Projects API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Successfully Create a New Project */
  test("✅ Should create a new project", async () => {
    service.createProject.mockResolvedValue({ status: true, statusCode: 201, message: "Project created successfully." });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", ngoID: 1001, projectName: "Health Initiative", createdBy: 2 }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 1 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
  });

  /** ✅ Test Case 2: Successfully Update an Existing Project */
  test("✅ Should update an existing project", async () => {
    service.updateProject.mockResolvedValue({ status: true, statusCode: 200, message: "Project updated successfully." });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "u", projectID: 2001, ngoID: 1001, projectName: "Updated Health Initiative" }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 2 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ✅ Test Case 3: Successfully Retrieve Project List */
  test("✅ Should retrieve list of projects", async () => {
    service.getProjects.mockResolvedValue({
      status: true,
      statusCode: 200,
      message: "Projects retrieved successfully.",
      payload: [{ PROJECT_ID: 2001, PROJECT_NAME: "Health Initiative" }],
    });

    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "g", ngoID: 1001 }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 3 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 4: Duplicate Project Creation */
  test("❌ Should return 409 if project already exists", async () => {
    service.createProject.mockResolvedValue({ status: false, statusCode: 409, message: "Project already exists." });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", ngoID: 1001, projectName: "Existing Project", createdBy: 2 }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 4 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.CONFLICT);
  });

  /** ❌ Test Case 5: Try Updating a Non-Existing Project */
  test("❌ Should return 404 if project does not exist", async () => {
    service.updateProject.mockResolvedValue({ status: false, statusCode: 404, message: "Project not found." });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "u", projectID: 9999, ngoID: 1001, projectName: "Non-Existent Project" }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 5 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ❌ Test Case 6: Try Getting Projects for a Non-Existing NGO */
  test("❌ Should return 404 if no projects found for NGO", async () => {
    service.getProjects.mockResolvedValue({ status: false, statusCode: 404, message: "No projects found." });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "g", ngoID: 9999 }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 6 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ❌ Test Case 7: Unauthorized Access (User is not NGO Admin) */
  test("❌ Should return 403 if user is not NGO Admin", async () => {
    verifyToken.mockResolvedValue({ success: true, user: { role: 3 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", ngoID: 1001, projectName: "Education Initiative", createdBy: 3 }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 7 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.FORBIDDEN);
  });

  /** ❌ Test Case 8: Invalid reqType */
  test("❌ Should return 400 if reqType is invalid", async () => {
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "invalid" }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 8 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ❌ Test Case 9: Missing Required Fields */
  test("❌ Should return 400 if required fields are missing", async () => {
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s" }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 9 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ❌ Test Case 10: No Authentication Token */
  test("❌ Should return 401 if authentication token is missing", async () => {
    const event = {
      headers: {},
      body: JSON.stringify({ reqType: "s", ngoID: 1001, projectName: "Missing Token Project" }),
    };

    const response = await manageProjects.handler(event);
    console.log("Test Case 10 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.UNAUTHORIZED);
  });
});
