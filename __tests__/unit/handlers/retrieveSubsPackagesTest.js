const service = require("../../../src/handlers/retrieveSubsPackages/service");
const retrieveSubsPackages = require("../../../src/handlers/retrieveSubsPackages/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "fetchAllPlans");
jest.spyOn(service, "fetchPlanById");
jest.spyOn(service, "fetchPlansByStatus");

describe("Retrieve Subscription Packages API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Retrieve all subscription plans */
  test("✅ Should retrieve all subscription plans successfully", async () => {
    service.fetchAllPlans.mockResolvedValue([
      { PLAN_ID: 1, PLAN_NAME: "Basic Plan", PLAN_PRICE: 9.99, STATUS: "ACTIVE" },
    ]);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "fetch" }),
    };

    const response = await retrieveSubsPackages.handler(event);
    console.log("Test Case 1:", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ✅ Test Case 2: Retrieve a specific plan by PLAN_ID */
  test("✅ Should retrieve a specific subscription plan", async () => {
    service.fetchPlanById.mockResolvedValue({ PLAN_ID: 2, PLAN_NAME: "Premium Plan", STATUS: "ACTIVE" });
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "fetch", PLAN_ID: 2 }),
    };

    const response = await retrieveSubsPackages.handler(event);
    console.log("Test Case 2:", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 3: Retrieve a non-existent plan */
  test("❌ Should return not found if PLAN_ID does not exist", async () => {
    service.fetchPlanById.mockResolvedValue(null);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "fetch", PLAN_ID: 999 }),
    };

    const response = await retrieveSubsPackages.handler(event);
    console.log("Test Case 3:", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ✅ Test Case 4: Retrieve active plans */
  test("✅ Should retrieve active plans successfully", async () => {
    service.fetchPlansByStatus.mockResolvedValue([
      { PLAN_ID: 3, PLAN_NAME: "Pro Plan", STATUS: "ACTIVE" },
    ]);
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "fetch", PLAN_STATUS: "ACTIVE" }),
    };

    const response = await retrieveSubsPackages.handler(event);
    console.log("Test Case 4:", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 5: Unauthorized request */
  test("❌ Should return forbidden if user is not an admin", async () => {
    verifyToken.mockResolvedValue({ role: 2 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "fetch" }),
    };

    const response = await retrieveSubsPackages.handler(event);
    console.log("Test Case 5:", response);
    expect(response.statusCode).toBe(HTTP_CODE.FORBIDDEN);
  });

  /** ❌ Test Case 6: Invalid reqType */
  test("❌ Should return bad request for invalid reqType", async () => {
    verifyToken.mockResolvedValue({ role: 1 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "invalid" }),
    };

    const response = await retrieveSubsPackages.handler(event);
    console.log("Test Case 6:", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });
});
