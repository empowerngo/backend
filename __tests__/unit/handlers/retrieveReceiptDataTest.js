const service = require("../../../src/handlers/retrieveReceiptData/service");
const retrieveReceiptData = require("../../../src/handlers/retrieveReceiptData/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

jest.spyOn(service, "fetchReceiptData");

describe("Retrieve Receipt Data API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Retrieve Receipt Data Successfully */
  test("✅ Should retrieve receipt data for valid inputs", async () => {
    console.log("Test Case 1 being executed");

    service.fetchReceiptData.mockResolvedValue({
      DONOR_NAME: "John Doe",
      DONOR_ADDRESS: "123 Main St, Mumbai, Maharashtra, India - 400001",
      DONOR_MOBILE: "9876543210",
      DONATION_DATE: "2024-02-16",
      AMOUNT: 5000,
      RECEIPT_NUMBER: "REC12345",
      NGO_NAME: "Helping Hands",
    });

    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ DONATION_ID: 101, DONOR_ID: 501, NGO_ID: 201 }),
    };

    const response = await retrieveReceiptData.handler(event);
    console.log("Test Case 1 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 2: Invalid Input Data */
  test("❌ Should return 400 for missing donation ID", async () => {
    console.log("Test Case 2 being executed");

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ DONOR_ID: 501, NGO_ID: 201 }),
    };

    const response = await retrieveReceiptData.handler(event);
    console.log("Test Case 2 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ❌ Test Case 3: Unauthorized Request */
  test("❌ Should return 401 if authentication token is missing", async () => {
    console.log("Test Case 3 being executed");

    const event = {
      headers: {},
      body: JSON.stringify({ DONATION_ID: 101, DONOR_ID: 501, NGO_ID: 201 }),
    };

    const response = await retrieveReceiptData.handler(event);
    console.log("Test Case 3 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.UNAUTHORIZED);
  });

  /** ❌ Test Case 4: Receipt Data Not Found */
  test("❌ Should return 404 if no receipt data is found", async () => {
    console.log("Test Case 4 being executed");

    service.fetchReceiptData.mockResolvedValue(null);
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ DONATION_ID: 999, DONOR_ID: 888, NGO_ID: 777 }),
    };

    const response = await retrieveReceiptData.handler(event);
    console.log("Test Case 4 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ❌ Test Case 5: Internal Server Error */
  test("❌ Should return 500 if there is a server error", async () => {
    console.log("Test Case 5 being executed");

    service.fetchReceiptData.mockImplementation(() => {
      throw new Error("Database connection failed");
    });

    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ DONATION_ID: 101, DONOR_ID: 501, NGO_ID: 201 }),
    };

    const response = await retrieveReceiptData.handler(event);
    console.log("Test Case 5 - ", response);
    expect(response.statusCode).toBe(HTTP_CODE.INTERNAL_SERVER_ERROR);
  });
});
