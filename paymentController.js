const { getAuthToken, createOrder, generatePaymentKey } = require('../services/paymobService');

async function handlePaymentRequest(req, res) {
  const formData = req.body;

  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'phone', 'area', 'buildingNumber', 'totalCars', 'totalPrice'];
  const missingFields = requiredFields.filter(field => !formData[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  try {
    const cars = formData.cars || [];

    // Step 1: Get Auth Token from PayMob
    const auth_token = await getAuthToken();

    // Step 2: Create Order
    const amount_cents = Math.round(formData.totalPrice * 100); // Convert EGP to cents
    const items = cars.map(car => ({
      name: `${car.brand} ${car.model}`,
      amount_cents: car.plan === "6" ? 70000 : 35000,
      description: `Car Wash Subscription - ${car.color} (${car.plate})`,
      quantity: "1"
    }));

    const order_id = await createOrder(auth_token, amount_cents, items);

    // Step 3: Generate Payment Key
    const billing_data = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: "optimumauto.oa@gmail.com", // Optional: collect from user
      phone_number: formData.phone,
      shipping_method: "NA",
      address: `${formData.area}, ${formData.buildingNumber}`,
      city: formData.area,
      country: "EG"
    };

    const payment_token = await generatePaymentKey(auth_token, order_id, billing_data);

    // Step 4: Return iframe URL
    const iframeUrl = `https://accept.paymob.com/v1/iframes/ ${process.env.PAYMOB_IFRAME_ID}?payment_token=${payment_token}&amount=${amount_cents}`;

    return res.json({
      success: true,
      iframeUrl
    });

  } catch (error) {
    console.error("Error creating PayMob payment:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
}

module.exports = {
  handlePaymentRequest
};