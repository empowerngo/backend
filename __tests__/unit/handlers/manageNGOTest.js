const service = require("../../../src/handlers/manageNGO/service");
const manageNGO = require("../../../src/handlers/manageNGO/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "checkExistingNGO");
jest.spyOn(service, "registerNGO");
jest.spyOn(service, "updateNGO");

describe("Manage NGO API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Successfully Register New NGO (reqType = "s") */
  test("✅ Should register a new NGO when reqType is 's'", async () => {
    service.checkExistingNGO.mockResolvedValue(null);
    service.registerNGO.mockResolvedValue(1001);
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        ngoName: "Helping Hands",
        ngoAddress: "123 Street, Mumbai",
        ngoCity: "Mumbai",
        ngoState: "Maharashtra",
        ngoCountry: "India",
        ngoPinCode: "400001",
        ngoEmail: "contact@helpinghands.org",
        ngoContact: "9876543210",
        ngo80GNumber: "80G123456",
        ngo12ANumber: "12A123456",
        ngoCSRNumber: "CSR123",
        ngoFCRANumber: "FCRA123",
        ngoPAN: "ABCDE1234F",
        contactPerson: "John Doe",
        ngoRegNumber: "REG123",
        logoURL: "http://example.com/logo.png",
        signatureURL: "http://example.com/signature.png",
        authorizedPerson: "Jane Doe",
      }),
    };

    const response = await manageNGO.handler(event);
    console.log("Test Case 1 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
    expect(JSON.parse(response.body).message).toBe("NGO registered successfully.");
    expect(JSON.parse(response.body).payload.ngoID).toBe(1001);
  });

  /** ✅ Test Case 2: Successfully Update NGO (reqType = "u") */
  test("✅ Should update an existing NGO when reqType is 'u'", async () => {
    service.updateNGO.mockResolvedValue(true);
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "u",
        ngoID: 1001,
        ngoName: "Helping Hands Updated",
        ngoAddress: "456 New Street, Mumbai",
        ngoCity: "Pune",
        ngoState: "Maharashtra",
        ngoCountry: "India",
        ngoPinCode: "411001",
        ngoEmail: "updated@helpinghands.org",
        ngoContact: "9123456789",
        ngo80GNumber: "80G987654",
        ngo12ANumber: "12A987654",
        ngoCSRNumber: "CSR987",
        ngoFCRANumber: "FCRA987",
        ngoPAN: "ABCDE1234Z",
        contactPerson: "Updated Person",
        ngoRegNumber: "REG456",
        logoURL: "http://example.com/new_logo.png",
        signatureURL: "http://example.com/new_signature.png",
        authorizedPerson: "Updated Authorized Person",
      }),
    };

    const response = await manageNGO.handler(event);
    console.log("Test Case 2 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
    expect(JSON.parse(response.body).message).toBe("NGO updated successfully.");
  });

  /** ❌ Test Case 3: Conflict When NGO Already Exists */
  test("❌ Should return 409 if NGO already exists", async () => {
    service.checkExistingNGO.mockResolvedValue(1001);
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        ngoName: "Helping Hands",
        ngoAddress: "123 Street, Mumbai",
        ngoCity: "Mumbai",
        ngoState: "Maharashtra",
        ngoCountry: "India",
        ngoPinCode: "400001",
        ngoEmail: "contact@helpinghands.org",
        ngoContact: "9876543210",
        ngo80GNumber: "80G123456",
        ngo12ANumber: "12A123456",
        ngoCSRNumber: "CSR123",
        ngoFCRANumber: "FCRA123",
        ngoPAN: "ABCDE1234F",
        contactPerson: "John Doe",
        ngoRegNumber: "REG123",
        logoURL: "http://example.com/logo.png",
        signatureURL: "http://example.com/signature.png",
        authorizedPerson: "Jane Doe",
        ngoEmail: "contact@helpinghands.org",
    }),
    };

    const response = await manageNGO.handler(event);
    console.log("Test Case 3 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.CONFLICT);
    expect(JSON.parse(response.body).message).toBe("An NGO with this Email or PAN already exists.");
  });

  /** ❌ Test Case 4: Unauthorized User */
  test("❌ Should return 403 if user is not authorized to register NGO", async () => {
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        ngoName: "Helping Hands",
        ngoAddress: "123 Street, Mumbai",
        ngoCity: "Mumbai",
        ngoState: "Maharashtra",
        ngoCountry: "India",
        ngoPinCode: "400001",
        ngoEmail: "contact@helpinghands.org",
        ngoContact: "9876543210",
        ngo80GNumber: "80G123456",
        ngo12ANumber: "12A123456",
        ngoCSRNumber: "CSR123",
        ngoFCRANumber: "FCRA123",
        ngoPAN: "ABCDE1234F",
        contactPerson: "John Doe",
        ngoRegNumber: "REG123",
        logoURL: "http://example.com/logo.png",
        signatureURL: "http://example.com/signature.png",
        authorizedPerson: "Jane Doe",        
      }),
    };

    const response = await manageNGO.handler(event);
    console.log("Test Case 4 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.FORBIDDEN);
    //expect(JSON.parse(response.body).message).toBe("Only Super Admin role can register NGOs.");
  });

  /** ❌ Test Case 5: NGO Update Fails If NGO Does Not Exist */
  test("❌ Should return 404 if NGO ID is not found for update", async () => {
    service.updateNGO.mockResolvedValue(false);
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "u",
        ngoID: 9999, // Non-existent NGO ID
        ngoName: "Non-existent NGO",
      }),
    };

    const response = await manageNGO.handler(event);
    console.log("Test Case 5 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
    expect(JSON.parse(response.body).message).toBe("NGO not found or no changes made.");
  });

  /** ❌ Test Case 6: Invalid reqType */
  test("❌ Should return 400 if reqType is invalid", async () => {
    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "invalid",
      }),
    };

    const response = await manageNGO.handler(event);
    console.log("Test Case 6 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
    //expect(JSON.parse(response.body).message).toBe(`\\"reqType\\" must be one of [s, u]`);
  });

  /** ❌ Test Case 7: Missing Required Fields */
  test("❌ Should return 400 if required fields are missing in 's' request", async () => {
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        ngoName: "Test NGO",
      }),
    };

    const response = await manageNGO.handler(event);
    console.log("Test Case 7 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
    expect(JSON.parse(response.body).message).toMatch(/is required/);
  });

  /** ❌ Test Case 8: Authentication Fails */
  test("❌ Should return 401 if authentication token is missing", async () => {
    verifyToken.mockResolvedValue(null);

    const event = {
      headers: {},
      body: JSON.stringify({
        reqType: "s",
      }),
    };

    const response = await manageNGO.handler(event);
    console.log("Test Case 8 ", response);
    expect(response.statusCode).toBe(HTTP_CODE.UNAUTHORIZED);
    expect(JSON.parse(response.body).message).toBe("Unauthorized");
  });
});
