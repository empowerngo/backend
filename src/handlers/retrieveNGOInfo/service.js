const {
  sequelize,
  QueryTypes
} = require("/opt/nodejs/utils/SequelizeWriteConnection");

// Fetch all NGOs
exports.fetchNGOList = async () => {
  const query = ` SELECT
    n.NGO_ID, n.NGO_NAME, n.NGO_ADDRESS, n.NGO_CITY, n.NGO_STATE, n.NGO_COUNTRY, n.NGO_PINCODE,
    n.NGO_EMAIL, n.NGO_CONTACT, n.NGO_80G_NUMBER, n.REG80G_DATE, n.NGO_12A_NUMBER, n.NGO_CSR_NUMBER, n.NGO_FCRA_NUMBER,
    n.NGO_PAN, n.CONTACT_PERSON, n.NGO_REG_NUMBER, n.LOGO_URL, n.SIGNATURE_URL, n.SEAL_URL, n.AUTHORIZED_PERSON,
    n.CREATED_AT, n.UPDATED_AT, ns.SP_PLANID, s.PLAN_NAME, ns.SP_SUB_DATE, ns.SP_END_DATE, ns.SP_STATUS
    FROM
    TB_NGO n
LEFT JOIN
    TB_NGO_SUBSCRIPTION ns ON n.NGO_ID = ns.NGO_ID
LEFT JOIN
    TB_SUBS_PLANS s ON ns.SP_ID = s.PLAN_ID
WHERE
    n.NGO_ID`;
  const ngos = await sequelize.query(query, { type: QueryTypes.SELECT });

  return ngos.map(ngo => ({
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
    reg80GDate: ngo.REG80G_DATE,
    ngo12ANumber: ngo.NGO_12A_NUMBER,
    ngoCSRNumber: ngo.NGO_CSR_NUMBER,
    ngoFCRANumber: ngo.NGO_FCRA_NUMBER,
    ngoPAN: ngo.NGO_PAN,
    contactPerson: ngo.CONTACT_PERSON,
    ngoRegNumber: ngo.NGO_REG_NUMBER,
    logoURL: ngo.LOGO_URL,
    signatureURL: ngo.SIGNATURE_URL,
    ngoSealURL: ngo.SEAL_URL,
    authorizedPerson: ngo.AUTHORIZED_PERSON,
    planID: ngo.SP_PLANID,
    planName: ngo.PLAN_NAME,
    subsDate: ngo.SP_SUB_DATE,
    planExpDate: ngo.SP_END_DATE,
    createdAt: ngo.CREATED_AT,
    updatedAt: ngo.UPDATED_AT
  }));
};

// Fetch NGO by ID
exports.fetchNGOInfo = async ngoID => {
  const query = `
     SELECT
    n.NGO_ID, n.NGO_NAME, n.NGO_ADDRESS, n.NGO_CITY, n.NGO_STATE, n.NGO_COUNTRY, n.NGO_PINCODE,
    n.NGO_EMAIL, n.NGO_CONTACT, n.NGO_80G_NUMBER, n.REG80G_DATE, n.NGO_12A_NUMBER, n.NGO_CSR_NUMBER, n.NGO_FCRA_NUMBER,
    n.NGO_PAN, n.CONTACT_PERSON, n.NGO_REG_NUMBER, n.LOGO_URL, n.SIGNATURE_URL, n.SEAL_URL, n.AUTHORIZED_PERSON,
    n.CREATED_AT, n.UPDATED_AT, ns.SP_PLANID, s.PLAN_NAME, ns.SP_SUB_DATE, ns.SP_END_DATE, ns.SP_STATUS
    FROM
    TB_NGO n
LEFT JOIN
    TB_NGO_SUBSCRIPTION ns ON n.NGO_ID = ns.NGO_ID
LEFT JOIN
    TB_SUBS_PLANS s ON ns.SP_ID = s.PLAN_ID
WHERE
    n.NGO_ID = ?;
  `;

  const result = await sequelize.query(query, {
    replacements: [ngoID],
    type: QueryTypes.SELECT
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
    reg80GDate: ngo.REG80G_DATE,
    ngo12ANumber: ngo.NGO_12A_NUMBER,
    ngoCSRNumber: ngo.NGO_CSR_NUMBER,
    ngoFCRANumber: ngo.NGO_FCRA_NUMBER,
    ngoPAN: ngo.NGO_PAN,
    contactPerson: ngo.CONTACT_PERSON,
    ngoRegNumber: ngo.NGO_REG_NUMBER,
    logoURL: ngo.LOGO_URL,
    signatureURL: ngo.SIGNATURE_URL,
    ngoSealURL: ngo.SEAL_URL,
    authorizedPerson: ngo.AUTHORIZED_PERSON,
    planID: ngo.SP_PLANID,
    planName: ngo.PLAN_NAME,
    subsDate: ngo.SP_SUB_DATE,
    planExpDate: ngo.SP_END_DATE,
    createdAt: ngo.CREATED_AT,
    updatedAt: ngo.UPDATED_AT
  };
};
