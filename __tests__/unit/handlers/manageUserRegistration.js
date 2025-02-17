const service = require("../../../src/handlers/manageUserRegistration/service");
const manageUserRegistration = require("../../../src/handlers/manageUserRegistration/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "checkExistingUser");
jest.spyOn(service, "createUser");
jest.spyOn(service, "linkUserToNGO");
jest.spyOn(service, "updateUserStatus");

describe("Manage User Registration API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Super Admin Creates Another Super Admin */
  test("✅ (1) Super Admin should create a Super Admin", async () => {
    service.checkExistingUser.mockResolvedValue(null);
    service.createUser.mockResolvedValue(101);
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        firstName: "John",
        lastName: "Doe",
        email: "admin@ngo.com",
        contactNumber: "9876543210",
        password: "Pass1234",
        roleCode: 1,
        createdBy: 1,
      }),
    };

    const response = await manageUserRegistration.handler(event);
    console.log("Test Case 1 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
  });

  /** ✅ Test Case 2: Super Admin Creates NGO Admin */
  test("✅ (2) Super Admin should create an NGO Admin", async () => {
    service.checkExistingUser.mockResolvedValue(null);
    service.createUser.mockResolvedValue(102);
    service.linkUserToNGO.mockResolvedValue(true);
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        firstName: "Jane",
        lastName: "Smith",
        email: "admin@ngo.org",
        contactNumber: "9876543211",
        password: "Pass5678",
        roleCode: 2,
        createdBy: 1,
        ngoID: 2001,
      }),
    };

    const response = await manageUserRegistration.handler(event);
    console.log("Test Case 2 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
  });

  /** ❌ Test Case 3: Invalid Request - roleCode = 1 but NGO ID Provided */
  test("❌ (3) Should return error if roleCode 1 is provided with ngoID", async () => {
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });
    
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        firstName: "Invalid",
        lastName: "User",
        email: "invalid.user@example.com",
        contactNumber: "8123456789",
        password: "InvalidPass123",
        roleCode: 1,
        createdBy: 99,
        ngoID: 10,
      }),
    };

    const response = await manageUserRegistration.handler(event);
    console.log("Test Case 3 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ✅ Test Case 4: Successfully Update User Status */
  test("✅ (4) Should update user status to ACTIVE", async () => {
    service.updateUserStatus.mockResolvedValue(true);
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "u", userID: 101, status: "ACTIVE" }),
    };

    const response = await manageUserRegistration.handler(event);
    console.log("Test Case 4 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 5: Attempt to Update User Status Without userID */
  test("❌ (5) Should return 400 if userID is missing when updating status", async () => {
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });
    
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "u", status: "ACTIVE" }), // Missing userID
    };

    const response = await manageUserRegistration.handler(event);
    console.log("Test Case 5 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ❌ Test Case 6: Invalid Status Value */
  test("❌ (6) Should return error if invalid status is provided", async () => {
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });
    
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "u", userID: 10, status: "DELETED" }),
    };

    const response = await manageUserRegistration.handler(event);
    console.log("Test Case 6 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });
});
