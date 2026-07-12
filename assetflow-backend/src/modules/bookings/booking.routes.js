const express = require('express');
const controller = require('./booking.controller');
const requireAuth = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', controller.createBooking); // any logged-in employee can book a resource
router.post('/:bookingId/cancel', controller.cancelBooking);

module.exports = router;
