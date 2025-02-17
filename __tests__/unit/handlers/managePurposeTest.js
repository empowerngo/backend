const service = require("../../../src/handlers/managePurpose/service");
const managePurposes = require("../../../src/handlers/managePurpose/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "createPurpose");
jest.spyOn(service, "updatePurpose");
jest.spyOn(service, "getPurposes");

describe("Manage Purposes API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Successfully Create a New Purpose */
  test("✅ Should create a new purpose", async () => {
    service.createPurpose.mockResolvedValue({ status: true, statusCode: 201, message: "Purpose created successfully." });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", ngoID: 1001, projectID: 2001, purposeName: "Education Support", createdBy: 2 }),
    };

    const response = await managePurposes.handler(event);
    console.log("Test Case 1 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
  });

  /** ✅ Test Case 2: Successfully Update an Existing Purpose */
  test("✅ Should update an existing purpose", async () => {
    service.updatePurpose.mockResolvedValue({ status: true, statusCode: 200, message: "Purpose updated successfully.",createdBy: 2 });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "u", purposeID: 3001, ngoID: 1001, projectID: 2001, purposeName: "Updated Purpose" }),
    };

    const response = await managePurposes.handler(event);
    console.log("Test Case 2 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ✅ Test Case 3: Successfully Retrieve Purpose List */
  test("✅ Should retrieve list of purposes", async () => {
    service.getPurposes.mockResolvedValue({
      status: true,
      statusCode: 200,
      message: "Purposes retrieved successfully.",
      payload: [{ PURPOSE_ID: 3001, PURPOSE_NAME: "Education Support" }],
    });

    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "g", ngoID: 1001, projectID: 2001 }),
    };

    const response = await managePurposes.handler(event);
    console.log("Test Case 3 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 4: Duplicate Purpose Creation */
  test("❌ Should return 409 if purpose already exists", async () => {
    service.createPurpose.mockResolvedValue({ status: false, statusCode: 409, message: "Purpose already exists." });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", ngoID: 1001, projectID: 2001, purposeName: "Existing Purpose", createdBy: 2 }),
    };

    const response = await managePurposes.handler(event);
    console.log("Test Case 4 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.CONFLICT);
  });

  /** ❌ Test Case 5: Try Updating a Non-Existing Purpose */
  test("❌ Should return 404 if purpose does not exist", async () => {
    service.updatePurpose.mockResolvedValue({ status: false, statusCode: 404, message: "Purpose not found." });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "u", purposeID: 9999, ngoID: 1001, projectID: 2001, purposeName: "Non-Existent Purpose" }),
    };

    const response = await managePurposes.handler(event);
    console.log("Test Case 5 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ❌ Test Case 6: Try Getting Purposes for a Non-Existing Project */
  test("❌ Should return 404 if no purposes found for project", async () => {
    service.getPurposes.mockResolvedValue({ status: false, statusCode: 404, message: "No purposes found." });
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "g", ngoID: 1001, projectID: 9999 }),
    };

    const response = await managePurposes.handler(event);
    console.log("Test Case 6 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ❌ Test Case 7: Unauthorized Access (User is not NGO Admin) */
  test("❌ Should return 403 if user is not NGO Admin", async () => {
    verifyToken.mockResolvedValue({ success: true, user: { role: 3 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", ngoID: 1001, projectID: 2001, purposeName: "Health Support", createdBy: 3 }),
    };

    const response = await managePurposes.handler(event);
    console.log("Test Case 7 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.FORBIDDEN);
  });

  /** ❌ Test Case 8: Invalid reqType */
  test("❌ Should return 400 if reqType is invalid", async () => {
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "invalid" }),
    };

    const response = await managePurposes.handler(event);
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

    const response = await managePurposes.handler(event);
    console.log("Test Case 9 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ❌ Test Case 10: No Authentication Token */
  test("❌ Should return 401 if authentication token is missing", async () => {
    const event = {
      headers: {},
      body: JSON.stringify({ reqType: "s", ngoID: 1001, projectID: 2001, purposeName: "Missing Token Purpose" }),
    };

    const response = await managePurposes.handler(event);
    console.log("Test Case 10cls - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.UNAUTHORIZED);
  });
});
