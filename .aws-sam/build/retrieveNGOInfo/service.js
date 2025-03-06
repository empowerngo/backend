const { sequelize, QueryTypes } = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Fetch all NGOs
exports.fetchNGOList = async () => {
  const query = `
    SELECT NGO_ID, NGO_NAME, NGO_CITY, NGO_STATE, NGO_EMAIL, NGO_CONTACT, NGO_PAN, NGO_REG_NUMBER
    FROM TB_NGO;
  `;
  const ngos = await sequelize.query(query, { type: QueryTypes.SELECT });

  return ngos.map(ngo => ({
    ngoID: ngo.NGO_ID,
    ngoName: ngo.NGO_NAME,
    ngoCity: ngo.NGO_CITY,
    ngoState: ngo.NGO_STATE,
    ngoEmail: ngo.NGO_EMAIL,
    ngoContact: ngo.NGO_CONTACT,
    ngoPAN: ngo.NGO_PAN,
    ngoRegNumber: ngo.NGO_REG_NUMBER,
  }));
};

// Fetch NGO by ID
exports.fetchNGOInfo = async (ngoID) => {
  const query = `
    SELECT 
      NGO_ID, NGO_NAME, NGO_ADDRESS, NGO_CITY, NGO_STATE, NGO_COUNTRY, NGO_PINCODE, 
      NGO_EMAIL, NGO_CONTACT, NGO_80G_NUMBER, NGO_12A_NUMBER, NGO_CSR_NUMBER, NGO_FCRA_NUMBER, 
      NGO_PAN, CONTACT_PERSON, NGO_REG_NUMBER, LOGO_URL, SIGNATURE_URL, AUTHORIZED_PERSON, 
      CREATED_AT, UPDATED_AT 
    FROM TB_NGO 
    WHERE NGO_ID = ?;
  `;

  const result = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT,
  });

  if (result.length === 0) return null;

  const ngo = result[0];

  return {
    ngoID: ngo.NGO_ID,
    ngoName: ngo.NGO_NAME,
    ngoAddress: ngo.NGO_ADDRESS,
    ngoCity: ngo.NGO_CITY,
    ngoState: ngo.NGO_STATE,
    ngoCountry: ngo.NGO_COUNTRY,
    ngoPinCode: ngo.NGO_PINCODE,
    ngoEmail: ngo.NGO_EMAIL,
    ngoContact: ngo.NGO_CONTACT,
    ngo80GNumber: ngo.NGO_80G_NUMBER,
    ngo12ANumber: ngo.NGO_12A_NUMBER,
    ngoCSRNumber: ngo.NGO_CSR_NUMBER,
    ngoFCRANumber: ngo.NGO_FCRA_NUMBER,
    ngoPAN: ngo.NGO_PAN,
    contactPerson: ngo.CONTACT_PERSON,
    ngoRegNumber: ngo.NGO_REG_NUMBER,
    logoURL: ngo.LOGO_URL,
    signatureURL: ngo.SIGNATURE_URL,
    authorizedPerson: ngo.AUTHORIZED_PERSON,
    createdAt: ngo.CREATED_AT,
    updatedAt: ngo.UPDATED_AT,
  };
};