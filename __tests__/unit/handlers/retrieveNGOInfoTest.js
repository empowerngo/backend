const service = require("../../../src/handlers/retrieveNGOInfo/service");
const retrieveNGOInfo = require("../../../src/handlers/retrieveNGOInfo/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "fetchNGOList");
jest.spyOn(service, "fetchNGOInfo");

describe("Retrieve NGO Information API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Retrieve NGO List */
  test("✅ Should retrieve list of NGOs when reqType is 'list'", async () => {
    service.fetchNGOList.mockResolvedValue([
      { NGO_ID: 1001, NGO_NAME: "Helping Hands", NGO_CITY: "Mumbai", NGO_STATE: "Maharashtra", NGO_EMAIL: "contact@helpinghands.org",NGO_CONTACT:"1234567890", NGO_PAN:"ABCPD1234T", NGO_REG_NUMBER:"REG123" },
    ]);

    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "list" }),
    };

    const response = await retrieveNGOInfo.handler(event);
    console.log("Test Case 1 ",response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
    expect(JSON.parse(response.body).message).toBe("NGO list retrieved successfully.");
  });

  /** ✅ Test Case 2: Retrieve Specific NGO Info */
  test("✅ Should retrieve NGO details when reqType is 'info' and ngoID is valid", async () => {
    service.fetchNGOInfo.mockResolvedValue({
      NGO_ID: 1001,
      NGO_NAME: "Helping Hands",
      NGO_EMAIL: "contact@helpinghands.org",
    });

    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "info", ngoID: 1001 }),
    };

    const response = await retrieveNGOInfo.handler(event);
    console.log("Test Case 2 ",response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 3: Invalid reqType */
  test("❌ Should return 400 if reqType is invalid", async () => {
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "invalid" }),
    };

    const response = await retrieveNGOInfo.handler(event);
    console.log("Test Case 3 ",response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ❌ Test Case 4: Missing ngoID for 'info' */
  test("❌ Should return 400 if reqType is 'info' but ngoID is missing", async () => {
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ reqType: "info" }),
    };

    const response = await retrieveNGOInfo.handler(event);
    console.log("Test Case 4 ",response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });
});
