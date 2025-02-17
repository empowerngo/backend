const service = require("../../../src/handlers/retrieveUsersInfo/service");
const retrieveUsersInfo = require("../../../src/handlers/retrieveUsersInfo/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "fetchUsersList");
jest.spyOn(service, "fetchUserInfo");

describe("Retrieve User Information API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Retrieve User List */
  test("✅ Should retrieve list of users when reqType is 'list'", async () => {
    service.fetchUsersList.mockResolvedValue([
      { USER_ID: 101, FNAME: "John", LNAME: "Doe", EMAIL: "john@example.com", ROLE_CODE: 2 },
    ]);

    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "list" }),
    };

    const response = await retrieveUsersInfo.handler(event);
    console.log("Test Case 1 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ✅ Test Case 2: Retrieve Specific User Info */
  test("✅ Should retrieve user details when reqType is 'info' and userID is valid", async () => {
    service.fetchUserInfo.mockResolvedValue({
      USER_ID: 101,
      FNAME: "John",
      LNAME: "Doe",
      EMAIL: "john@example.com",
      ROLE_CODE: 2,
    });

    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "info", userID: 101 }),
    };

    const response = await retrieveUsersInfo.handler(event);
    console.log("Test Case 2 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 3: Invalid reqType */
  test("❌ Should return 400 if reqType is invalid", async () => {
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "invalid" }),
    };

    const response = await retrieveUsersInfo.handler(event);
    console.log("Test Case 3 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ❌ Test Case 4: Missing userID for 'info' */
  test("❌ Should return 400 if reqType is 'info' but userID is missing", async () => {
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "info" }),
    };

    const response = await retrieveUsersInfo.handler(event);
    console.log("Test Case 4 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ❌ Test Case 5: Unauthorized Request (Missing Token) */
  test("❌ Should return 401 if authentication token is missing", async () => {
    const event = {
      headers: {},
      body: JSON.stringify({ reqType: "info", userID: 101 }),
    };

    const response = await retrieveUsersInfo.handler(event);
    console.log("Test Case 5 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.UNAUTHORIZED);
  });
});
