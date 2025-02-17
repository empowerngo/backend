const service = require("../../../src/handlers/manageDonor/service");
const manageDonor = require("../../../src/handlers/manageDonor/index");
const { verifyToken } = require("../../../src/layers/common-layer/nodejs/utils/auth");
const { HTTP_CODE } = require("../../../src/layers/common-layer/nodejs/utils/helper");

jest.mock("../../../src/layers/common-layer/nodejs/utils/auth");

// Mock Services
jest.spyOn(service, "getDonorByPAN");
jest.spyOn(service, "getDonorByID");
jest.spyOn(service, "addDonor");
jest.spyOn(service, "updateDonor");
jest.spyOn(service, "mapDonorToNGO");
jest.spyOn(service, "getDonorMapping"); 

describe("Manage Donor API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Case 1: Successfully Add New Donor (reqType = "s") */
  test("✅ Test Case 1 - Should add a new donor if PAN is not found", async () => {
    console.info("Executing Test Case 1");
    service.getDonorByPAN.mockResolvedValue(null);
    service.addDonor.mockResolvedValue(123);
    service.mapDonorToNGO.mockResolvedValue();
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        donorFName: "John",
        donorLName: "Doe",
        donorAddress: "123 Street, Mumbai",
        donorCity: "Mumbai",
        donorState: "Maharashtra",
        donorCountry: "India",
        donorPinCode: "400001",
        donorPAN: "ABCDE1234F",
        donorEmail: "john@example.com",
        donorMobile: "9876543210",
        donorProfession: "Engineer",
        donorType: "Individual",
        donorNGOID: 1
      }),
    };

    const response = await manageDonor.handler(event);
    console.log("Test Case 1 - Response:", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
  });

  /** ✅ Test Case 2: Update Existing Donor (reqType = "u") */
  test("✅ Test Case 2 - Should update an existing donor if donorID exists", async () => {
    console.info("Executing Test Case 2");
    service.getDonorByID.mockResolvedValue({ DONOR_ID: 123 });
    service.updateDonor.mockResolvedValue();
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        donorFName: "John",
        donorLName: "Doe",
        donorAddress: "123 Street, Mumbai",
        donorCity: "Mumbai",
        donorState: "Maharashtra",
        donorCountry: "India",
        donorPinCode: "400001",
        donorPAN: "ABCDE1234F",
        donorEmail: "john@example.com",
        donorMobile: "9876543210",
        donorProfession: "Engineer",
        donorType: "Individual",
        donorNGOID: 1
      }),
    };

    const response = await manageDonor.handler(event);
    console.log("Test Case 2 - Response:", response);
    expect(response.statusCode).toBe(HTTP_CODE.SUCCESS);
  });

  /** ❌ Test Case 3: Update Fails if Donor Does Not Exist */
  test("❌ Test Case 3 - Should return 404 if donorID does not exist for update", async () => {
    console.info("Executing Test Case 3");
    service.getDonorByID.mockResolvedValue(null);
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        donorFName: "John",
        donorLName: "Doe",
        donorAddress: "123 Street, Mumbai",
        donorCity: "Mumbai",
        donorState: "Maharashtra",
        donorCountry: "India",
        donorPinCode: "400001",
        donorPAN: "ABCDE1234F",
        donorEmail: "john@example.com",
        donorMobile: "9876543210",
        donorProfession: "Engineer",
        donorType: "Individual",
        donorNGOID: 1
      }),
    };

    const response = await manageDonor.handler(event);
    console.log("Test Case 3 - Response:", response);
    expect(response.statusCode).toBe(HTTP_CODE.NOT_FOUND);
  });

  /** ✅ Test Case 4: Map Donor if PAN exists */
  test("✅ Test Case 4 - Should map donor if PAN exists", async () => {
    console.info("Executing Test Case 4");
    service.getDonorByPAN.mockResolvedValue({ DONOR_ID: 123 });
    service.mapDonorToNGO.mockResolvedValue();
    verifyToken.mockResolvedValue({ success: true, user: { role: 3 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        donorFName: "John",
        donorLName: "Doe",
        donorAddress: "123 Street, Mumbai",
        donorCity: "Mumbai",
        donorState: "Maharashtra",
        donorCountry: "India",
        donorPinCode: "400001",
        donorPAN: "ABCDE1234F",
        donorEmail: "john@example.com",
        donorMobile: "9876543210",
        donorProfession: "Engineer",
        donorType: "Individual",
        donorNGOID: 1
      }),
    };

    const response = await manageDonor.handler(event);
    console.log("Test Case 4 - Response:", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
  });

  /** ❌ Test Case 5: Unauthorized User */
  test("❌ Test Case 5 - Should return 403 if user is not NGO-Admin or NGO-Staff", async () => {
    console.info("Executing Test Case 5");
    verifyToken.mockResolvedValue({ success: true, user: { role: 1 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        donorFName: "John",
        donorLName: "Doe",
        donorAddress: "123 Street, Mumbai",
        donorCity: "Mumbai",
        donorState: "Maharashtra",
        donorCountry: "India",
        donorPinCode: "400001",
        donorPAN: "ABCDE1234F",
        donorEmail: "john@example.com",
        donorMobile: "9876543210",
        donorProfession: "Engineer",
        donorType: "Individual",
        donorNGOID: 1
      }),
    };

    const response = await manageDonor.handler(event);
    console.log("Test Case 5 - Response:", response);
    expect(response.statusCode).toBe(HTTP_CODE.FORBIDDEN);
  });

  /** ❌ Test Case 6: Authentication */
  test("❌ Test Case 6 - Should return 401 if authentication token is missing", async () => {
    console.info("Executing Test Case 6");
    verifyToken.mockResolvedValue(null);

    const event = {
      headers: {},
      body: JSON.stringify({
        reqType: "s",
        donorFName: "John",
        donorLName: "Doe",
        donorAddress: "123 Street, Mumbai",
        donorCity: "Mumbai",
        donorState: "Maharashtra",
        donorCountry: "India",
        donorPinCode: "400001",
        donorPAN: "ABCDE1234F",
        donorEmail: "john@example.com",
        donorMobile: "9876543210",
        donorProfession: "Engineer",
        donorType: "Individual",
        donorNGOID: 1
      }),
    };

    const response = await manageDonor.handler(event);
    console.log("Test Case 6 - Response:", response);
    expect(response.statusCode).toBe(HTTP_CODE.UNAUTHORIZED);
  });

  /** ❌ Test Case 7: Missing Required Fields */
  test("❌ Test Case 7 - Should return 400 if required fields are missing", async () => {
    console.info("Executing Test Case 7");
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({}),
    };

    const response = await manageDonor.handler(event);
    console.log("Test Case 7 - Response:", response);
    expect(response.statusCode).toBe(HTTP_CODE.BAD_REQUEST);
  });

  /** ✅ Test Case 8: Donor Exists, But Not Mapped to NGO */
  test("✅ Test Case 8 - Should add donor-NGO mapping if donor exists but mapping does not exist", async () => {
    console.info("Executing Test Case 8");
    service.getDonorByPAN.mockResolvedValue({ DONOR_ID: 123 });
    service.getDonorMapping.mockResolvedValue(false);
    service.mapDonorToNGO.mockResolvedValue();
    verifyToken.mockResolvedValue({ success: true, user: { role: 2 } });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({
        reqType: "s",
        donorFName: "John",
        donorLName: "Doe",
        donorAddress: "123 Street, Mumbai",
        donorCity: "Mumbai",
        donorState: "Maharashtra",
        donorCountry: "India",
        donorPinCode: "400001",
        donorPAN: "ABCDE1234F",
        donorEmail: "john@example.com",
        donorMobile: "9876543210",
        donorProfession: "Engineer",
        donorType: "Individual",
        donorNGOID: 1
      }),
    };

    const response = await manageDonor.handler(event);
    console.log("Test Case 8 - Response:", response);
    expect(response.statusCode).toBe(HTTP_CODE.CREATED);
  });

});
