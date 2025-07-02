const express = require('express');
const router = express.Router();
const { handlePaymentRequest } = require('../controllers/paymentController');

// POST /api/payment/create-payment
router.post('/create-payment', handlePaymentRequest);

module.exports = router;