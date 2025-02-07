const HTTP_CODE = {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    REQUEST_TIMEOUT: 408,
    INTERNAL_SERVER_ERROR: 500,
    CONFLICT: 409,
    SERVICE_UNAVAILABLE: 503,
    DUPLICATE: 422,
  };
  
  const RESPONSE_MESSAGES = {
    DATA_UPDATED: "Data updated successfully",
    TRANSACTION_SUCCESS: "Transaction completed successfully",
    TRANSACTION_FAILED: "Transaction failed",
    VALIDATION_ERROR: "Validation error",
    RECORD_EXISTS: "Record already exists",
    SERVER_ERROR: "An internal server error occurred",
    NOT_FOUND: "Data not found",
  };
  
  const getResponseObject = ({
    status = true,
    statusCode = HTTP_CODE.SUCCESS,
    message = "",
    payload = [],
  } = {}) => {
    const response = {
      isBase64Encoded: false,
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Credentials": true,
      },
      body: {
        status: status ? "SUCCESS" : "FAILURE",
        statusCode,
        message: message || RESPONSE_MESSAGES.NOT_FOUND,
        payload: Array.isArray(payload) || typeof payload === "object" ? payload : [],
      },
    };
  
    return {
      ...response,
      body: JSON.stringify(response.body),
    };
  };
  
  module.exports = {
    HTTP_CODE,
    RESPONSE_MESSAGES,
    getResponseObject,
  };
  