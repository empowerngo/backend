const service = require("../../../src/handlers/manageSubsPackage/service");
const manageSubsPackage = require("../../../src/handlers/manageSubsPackage/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "createPlan");
jest.spyOn(service, "updatePlan");
jest.spyOn(service, "deletePlan");
jest.spyOn(service, "updatePlanStatus");

describe("Manage Subscription Packages API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Successfully create a subscription plan */
  test("✅ Should create a subscription plan successfully", async () => {
    service.createPlan.mockResolvedValue(101);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", action: "create", planName: "Basic Plan", planPrice: 9.99, numberOfUsers: 10, numberOfDonors: 5, numberOfDonations: 50 }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 1:", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
  });

  /** ❌ Test Case 2: Duplicate plan name */
  test("❌ Should return conflict if plan name already exists", async () => {
    service.createPlan.mockRejectedValue(new Error("Plan name already exists"));
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", action: "create", planName: "Basic Plan", planPrice: 9.99, numberOfUsers: 10, numberOfDonors: 5, numberOfDonations: 50 }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 2:", response);
    expect(response.statusCode).toBe(HTTP_CODE.CONFLICT);
  });

  /** ❌ Test Case 3: Missing required fields */
  test("❌ Should return bad request if required fields are missing", async () => {
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", action: "create" }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 3:", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ✅ Test Case 4: Successfully update a plan */
  test("✅ Should update a subscription plan successfully", async () => {
    service.updatePlan.mockResolvedValue(true);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", action: "update", planID: 101, planName: "Updated Plan", planPrice: 14.99 }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 4:", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 5: Update a non-existent plan */
  test("❌ Should return not found if plan does not exist", async () => {
    service.updatePlan.mockResolvedValue(false);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", action: "update", planID: 999 }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 5:", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ✅ Test Case 6: Successfully delete a plan */
  test("✅ Should delete a subscription plan successfully", async () => {
    service.deletePlan.mockResolvedValue(true);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", action: "delete", planID: 101 }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 6:", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 7: Delete a non-existent plan */
  test("❌ Should return not found if plan to delete does not exist", async () => {
    service.deletePlan.mockResolvedValue(false);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", action: "delete", planID: 999 }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 7:", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ✅ Test Case 8: Successfully update plan status */
  test("✅ Should update plan status successfully", async () => {
    service.updatePlanStatus.mockResolvedValue(true);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "u", planID: 101, status: "INACTIVE" }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 8:", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 9: Update status of a non-existent plan */
  test("❌ Should return not found if updating status of non-existent plan", async () => {
    service.updatePlanStatus.mockResolvedValue(false);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "u", planID: 999, status: "ACTIVE" }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 9:", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ❌ Test Case 10: Unauthorized user */
  test("❌ Should return forbidden if user is not an admin", async () => {
    verifyToken.mockResolvedValue({ role: 2 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "s", action: "create", planName: "Basic Plan", planPrice: 9.99 }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 10:", response);
    expect(response.statusCode).toBe(HTTP_CODE.FORBIDDEN);
  });

  /** ❌ Test Case 11: Invalid reqType */
  test("❌ Should return bad request for invalid reqType", async () => {
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "invalid" }),
    };

    const response = await manageSubsPackage.handler(event);
    console.log("Test Case 11:", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });
});
