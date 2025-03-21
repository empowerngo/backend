const {
  sequelize,
  QueryTypes
} = require("/opt/nodejs/utils/SequelizeWriteConnection");
const { encrypt, decrypt } = require("/opt/nodejs/utils/cryptohelper.js");

// Fetch all donors
exports.fetchDonorsList = async ngoID => {
  const query = `
     SELECT 
      D.DONOR_ID, D.DONOR_FNAME, D.DONOR_MNAME, D.DONOR_LNAME, 
   D.DONOR_ADDRESS, D.DONOR_CITY, D.DONOR_STATE,D.DONOR_COUNTRY, D.DONOR_PINCODE,
      D.DONOR_EMAIL, D.DONOR_MOBILE, D.DONOR_PAN, D.DONOR_ADHAR,D.DONOR_DOB, D.DONOR_TYPE,
      D.CREATED_AT, D.UPDATED_AT, D.DONOR_PROFESSION,
      N.NGO_ID, N.NGO_NAME
    FROM TB_DONOR D
    LEFT JOIN TB_NGO_DONOR_MAPPING M ON D.DONOR_ID = M.DONOR_ID
    LEFT JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID
    WHERE M.NGO_ID = ? order by 1 desc;
  `;
  const donors = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT
  });

  // Decrypt sensitive fields and align response with schema
  return donors.map(donor => ({
    // donorID: donor.DONOR_ID,
    // donorFName: decrypt(donor.DONOR_FNAME),
    // donorMName: donor.DONOR_MNAME ? decrypt(donor.DONOR_MNAME) : null,
    // donorLName: decrypt(donor.DONOR_LNAME),
    // donorEmail: decrypt(donor.DONOR_EMAIL),
    // donorMobile: decrypt(donor.DONOR_MOBILE ? donor.DONOR_MOBILE.toString() : ''),
    // donorPAN: donor.DONOR_PAN ? decrypt(donor.DONOR_PAN.toString()) : null,
    // donorType: donor.DONOR_TYPE,
    // createdAt: donor.CREATED_AT,
    donorID: donor.DONOR_ID,
    donorFName: decrypt(donor.DONOR_FNAME),
    donorMName: donor.DONOR_MNAME ? decrypt(donor.DONOR_MNAME) : null,
    donorLName: decrypt(donor.DONOR_LNAME),
    donorEmail: decrypt(donor.DONOR_EMAIL),
    donorAddress: donor.DONOR_ADDRESS,
    donorCity: donor.DONOR_CITY,
    donorState: donor.DONOR_STATE,
    donorCountry: donor.DONOR_COUNTRY,
    donorPinCode: donor.DONOR_PINCODE,
    donorProfession: donor.DONOR_PROFESSION,
    donorMobile: decrypt(donor.DONOR_MOBILE),
    donorPAN: donor.DONOR_PAN ? decrypt(donor.DONOR_PAN) : null,
    donorAdhar: donor.DONOR_ADHAR ? decrypt(donor.DONOR_ADHAR) : null,
    donorDOB: donor.DONOR_DOB,
    donorType: donor.DONOR_TYPE,
    // createdAt: donor.CREATED_AT, // Assuming you might want to send these as well.
    // updatedAt: donor.UPDATED_AT,
    donorNGOID: donor.NGO_ID, // Use the schema's variable name.
    ngoName: donor.NGO_NAME //Added the ngoName
  }));
};

// Fetch donor by ID
exports.fetchDonorInfo = async donorID => {
  const query = `
    SELECT 
      D.DONOR_ID, D.DONOR_FNAME, D.DONOR_MNAME, D.DONOR_LNAME, 
   D.DONOR_ADDRESS, D.DONOR_CITY, D.DONOR_STATE,D.DONOR_COUNTRY, D.DONOR_PINCODE,
      D.DONOR_EMAIL, D.DONOR_MOBILE, D.DONOR_PAN,D.DONOR_ADHAR,D.DONOR_DOB, D.DONOR_TYPE,
      D.CREATED_AT, D.UPDATED_AT, D.DONOR_PROFESSION,
      N.NGO_ID, N.NGO_NAME
    FROM TB_DONOR D
    LEFT JOIN TB_NGO_DONOR_MAPPING M ON D.DONOR_ID = M.DONOR_ID
    LEFT JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID
    WHERE D.DONOR_ID = ?;
  `;

  const result = await sequelize.query(query, {
    replacements: [donorID],
    type: QueryTypes.SELECT
  });

  if (result.length === 0) return null;

  const donor = result[0]; // Use a more desc

  // Decrypt sensitive fields before returning
  // Decrypt sensitive fields and align response with schema
  return {
    donorID: donor.DONOR_ID,
    donorFName: decrypt(donor.DONOR_FNAME),
    donorMName: donor.DONOR_MNAME ? decrypt(donor.DONOR_MNAME) : null,
    donorLName: decrypt(donor.DONOR_LNAME),
    donorEmail: decrypt(donor.DONOR_EMAIL),
    donorAddress: donor.DONOR_ADDRESS,
    donorCity: donor.DONOR_CITY,
    donorState: donor.DONOR_STATE,
    donorCountry: donor.DONOR_COUNTRY,
    donorPinCode: donor.DONOR_PINCODE,
    donorProfession: donor.DONOR_PROFESSION,
    donorMobile: decrypt(donor.DONOR_MOBILE),
    donorPAN: donor.DONOR_PAN ? decrypt(donor.DONOR_PAN) : null,
    donorAdhar: donor.DONOR_ADHAR ? decrypt(donor.DONOR_ADHAR) : null,
    donorDOB: donor.DONOR_DOB,
    donorType: donor.DONOR_TYPE,
    // createdAt: donor.CREATED_AT, // Assuming you might want to send these as well.
    // updatedAt: donor.UPDATED_AT,
    donorNGOID: donor.NGO_ID, // Use the schema's variable name.
    ngoName: donor.NGO_NAME //Added the ngoName
  };
};

exports.fetchDonorsListByNameOrMobile = async (
  donorFName,
  donorLName,
  donorMobile,
  donorPAN
) => {
  const query = `
     SELECT 
      D.DONOR_ID, D.DONOR_FNAME, D.DONOR_MNAME, D.DONOR_LNAME, 
   D.DONOR_ADDRESS, D.DONOR_CITY, D.DONOR_STATE,D.DONOR_COUNTRY, D.DONOR_PINCODE,
      D.DONOR_EMAIL, D.DONOR_MOBILE, D.DONOR_PAN, D.DONOR_ADHAR,D.DONOR_DOB, D.DONOR_TYPE,
      D.CREATED_AT, D.UPDATED_AT, D.DONOR_PROFESSION,
      N.NGO_ID, N.NGO_NAME
    FROM TB_DONOR D
    LEFT JOIN TB_NGO_DONOR_MAPPING M ON D.DONOR_ID = M.DONOR_ID
    LEFT JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID
    WHERE D.DONOR_FNAME = ? OR D.DONOR_LNAME = ? OR D.DONOR_MOBILE = ? OR D.DONOR_PAN = ?;
  `;
  const donors = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT
  });

  // Decrypt sensitive fields and align response with schema
  return donors.map(donor => ({
    donorID: donor.DONOR_ID,
    donorFName: decrypt(donor.DONOR_FNAME),
    donorMName: donor.DONOR_MNAME ? decrypt(donor.DONOR_MNAME) : null,
    donorLName: decrypt(donor.DONOR_LNAME),
    donorEmail: decrypt(donor.DONOR_EMAIL),
    donorAddress: donor.DONOR_ADDRESS,
    donorCity: donor.DONOR_CITY,
    donorState: donor.DONOR_STATE,
    donorCountry: donor.DONOR_COUNTRY,
    donorPinCode: donor.DONOR_PINCODE,
    donorProfession: donor.DONOR_PROFESSION,
    donorMobile: decrypt(donor.DONOR_MOBILE),
    donorPAN: donor.DONOR_PAN ? decrypt(donor.DONOR_PAN) : null,
    donorAdhar: donor.DONOR_ADHAR ? decrypt(donor.DONOR_ADHAR) : null,
    donorDOB: donor.DONOR_DOB,
    donorType: donor.DONOR_TYPE,
    donorNGOID: donor.NGO_ID, // Use the schema's variable name.
    ngoName: donor.NGO_NAME //Added the ngoName
  }));
};

exports.fetchDonorsListByParams = async (
  donorFName,
  donorLName,
  donorMobile,
  donorPAN
) => {
  let query = `
    SELECT 
      D.DONOR_ID, D.DONOR_FNAME, D.DONOR_MNAME, D.DONOR_LNAME, 
      D.DONOR_ADDRESS, D.DONOR_CITY, D.DONOR_STATE, D.DONOR_COUNTRY, D.DONOR_PINCODE,
      D.DONOR_EMAIL, D.DONOR_MOBILE, D.DONOR_PAN,D.DONOR_ADHAR,D.DONOR_DOB, D.DONOR_TYPE,
      D.CREATED_AT, D.UPDATED_AT, D.DONOR_PROFESSION,
      N.NGO_ID, N.NGO_NAME
    FROM TB_DONOR D
    LEFT JOIN TB_NGO_DONOR_MAPPING M ON D.DONOR_ID = M.DONOR_ID
    LEFT JOIN TB_NGO N ON M.NGO_ID = N.NGO_ID
    WHERE 1=1 `; // Start with a true condition

  const replacements = [];

  if (donorFName) {
    query += " AND D.DONOR_FNAME = ?";
    replacements.push(encrypt(donorFName)); //encrypt the search term.
  }
  if (donorLName) {
    query += " AND D.DONOR_LNAME = ?";
    replacements.push(encrypt(donorLName)); //encrypt the search term.
  }
  if (donorMobile) {
    query += " AND D.DONOR_MOBILE = ?";
    replacements.push(encrypt(donorMobile)); //encrypt the search term.
  }
  if (donorPAN) {
    query += " AND D.DONOR_PAN = ?";
    replacements.push(encrypt(donorPAN)); //encrypt the search term.
  }
  if (donorAdhar) {
    query += " AND D.DONOR_ADHAR = ?";
    replacements.push(encrypt(donorAdhar)); //encrypt the search term.
  }
  console.log("query = ", query);

  try {
    const donors = await sequelize.query(query, {
      replacements: replacements,
      type: QueryTypes.SELECT
    });

    // Decrypt sensitive fields and align response with schema
    return donors.map(donor => ({
      donorID: donor.DONOR_ID,
      donorFName: decrypt(donor.DONOR_FNAME),
      donorMName: donor.DONOR_MNAME ? decrypt(donor.DONOR_MNAME) : null,
      donorLName: decrypt(donor.DONOR_LNAME),
      donorEmail: decrypt(donor.DONOR_EMAIL),
      donorAddress: donor.DONOR_ADDRESS,
      donorCity: donor.DONOR_CITY,
      donorState: donor.DONOR_STATE,
      donorCountry: donor.DONOR_COUNTRY,
      donorPinCode: donor.DONOR_PINCODE,
      donorProfession: donor.DONOR_PROFESSION,
      donorMobile: decrypt(donor.DONOR_MOBILE),
      donorPAN: donor.DONOR_PAN ? decrypt(donor.DONOR_PAN) : null,
      donorAdhar: donor.DONOR_ADHAR ? decrypt(donor.DONOR_ADHAR) : null,
      donorDOB: donor.DONOR_DOB,
      donorType: donor.DONOR_TYPE,
      donorNGOID: donor.NGO_ID, // Use the schema's variable name.
      ngoName: donor.NGO_NAME //Added the ngoName
    }));
  } catch (error) {
    console.error("Error fetching donors:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
