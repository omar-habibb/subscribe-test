const axios = require('axios');

const PAYMOB_BASE_URL = 'https://accept.paymob.com/api ';

/**
 * Step 1: Get Auth Token
 */
async function getAuthToken() {
  try {
    const response = await axios.post(`${PAYMOB_BASE_URL}/auth/token`, {
      api_key: process.env.PAYMOB_API_KEY
    });

    return response.data.token;
  } catch (error) {
    console.error("Auth Token Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with PayMob");
  }
}

/**
 * Step 2: Create Order
 */
async function createOrder(token, amount_cents, items = []) {
  try {
    const response = await axios.post(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
      delivery_needed: "false",
      amount_cents,
      currency: process.env.PAYMOB_CURRENCY,
      items
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.id;
  } catch (error) {
    console.error("Create Order Error:", error.response?.data || error.message);
    throw new Error("Failed to create PayMob order");
  }
}

/**
 * Step 3: Generate Payment Key
 */
async function generatePaymentKey(token, order_id, billing_data) {
  try {
    const payload = {
      amount_cents,
      currency: process.env.PAYMOB_CURRENCY,
      order_id,
      billing_data
    };

    const response = await axios.post(
      `${PAYMOB_BASE_URL}/acceptance/payment-keys`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data.token;
  } catch (error) {
    console.error("Generate Payment Key Error:", error.response?.data || error.message);
    throw new Error("Failed to generate PayMob token");
  }
}

module.exports = {
  getAuthToken,
  createOrder,
  generatePaymentKey
};