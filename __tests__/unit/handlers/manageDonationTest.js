const service = require("../../../src/handlers/manageDonations/service");
const manageDonations = require("../../../src/handlers/manageDonations/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "generateReceiptNumber");
jest.spyOn(service, "createDonation");
jest.spyOn(service, "updateDonation");

describe("Manage Donations API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Successfully Create a Donation (reqType = "s") */
  test("✅ Should record a new donation when reqType is 's'", async () => {
    service.generateReceiptNumber.mockResolvedValue("NGO101-00045");
    service.createDonation.mockResolvedValue(true);
    verifyToken.mockResolvedValue({ role: 2 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        ngoID: 101,
        donorID: 5001,
        amount: 1000,
        bank: "HDFC",
        type: "E-Transfer",
        purpose: "Education",
        project: "Scholarship Program",
        note: "Monthly donation",
        donationDate: "2025-02-15T00:00:00.000Z"
      }),
    };

    const response = await manageDonations.handler(event);
    console.log("Test Case 1 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
    expect(JSON.parse(response.body).message).toBe("Donation recorded successfully.");
    expect(JSON.parse(response.body).payload.receiptNumber).toBe("NGO101-00045");
  });

  /** ✅ Test Case 2: Successfully Update a Donation (reqType = "u") */
  test("✅ Should update an existing donation when reqType is 'u'", async () => {
    service.updateDonation.mockResolvedValue(true);
    verifyToken.mockResolvedValue({ role: 2 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "u",
        donationID: 2025,
        donorID: 5001,
        amount: 1200,
        bank: "SBI",
        type: "E-Transfer",
        purpose: "Healthcare",
        project: "Medical Aid",
        note: "Updated amount",
         ngoID: 101,
      }),
    };

    const response = await manageDonations.handler(event);
    console.log("Test Case 2 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
    expect(JSON.parse(response.body).message).toBe("Donation updated successfully.");
  });

  /** ❌ Test Case 3: Unauthorized User (reqType = "s") */
  test("❌ Should return 403 if user is unauthorized to create donations", async () => {
    verifyToken.mockResolvedValue({ role: 1 }); // Unauthorized role

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        ngoID: 101,
        donorID: 5001,
        amount: 1000,
        roleCode: 1
      }),
    };

    const response = await manageDonations.handler(event);
    console.log("Test Case 3 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.FORBIDDEN);
    expect(JSON.parse(response.body).message).toBe("Only NGO-Admin or NGO-Staff can manage donations.");
  });

  /** ❌ Test Case 4: Unauthorized User (reqType = "u") */
  test("❌ Should return 403 if user is unauthorized to update donations", async () => {
    verifyToken.mockResolvedValue({ role: 3 }); // Unauthorized for update

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        ngoID: 101,
        donorID: 5001,
        amount: 1000,
        bank: "HDFC",
        type: "E-Transfer",
        purpose: "Education",
        project: "Scholarship Program",
        note: "Monthly donation",
        donationDate: "2025-02-15T00:00:00.000Z"
      }),
    };

    const response = await manageDonations.handler(event);
    console.log("Test Case 4 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.FORBIDDEN);
    expect(JSON.parse(response.body).message).toBe("Only NGO-Admin can update donations");
  });

  /** ❌ Test Case 5: Missing Required Fields */
  test("❌ Should return 400 if required fields are missing in 's' request", async () => {
    verifyToken.mockResolvedValue({ role: 2 });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        donorID: 5001, // Missing ngoID and amount
      }),
    };

    const response = await manageDonations.handler(event);
    console.log("Test Case 5 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
    expect(JSON.parse(response.body).message).toMatch(/is required/);
  });

  /** ❌ Test Case 6: Invalid reqType */
  test("❌ Should return 400 if reqType is invalid", async () => {
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "invalid",
      }),
    };

    const response = await manageDonations.handler(event);
    console.log("Test Case 6 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
    //expect(JSON.parse(response.body).message).toBe("Invalid request type.");
  });

  /** ❌ Test Case 7: Authentication Fails */
  test("❌ Should return 401 if authentication token is missing", async () => {
    verifyToken.mockResolvedValue(null);

    const event = {
      headers: {},
      body: JSON.stringify({
        reqType: "s",
      }),
    };

    const response = await manageDonations.handler(event);
    console.log("Test Case 7 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.UNAUTHORIZED);
    expect(JSON.parse(response.body).message).toBe("Invalid or missing token");
  });
});
