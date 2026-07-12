const bookingService = require('./booking.service');
const asyncHandler = require('../../utils/asyncHandler');

const createBooking = asyncHandler(async (req, res) => {
  const { resourceId, startTime, endTime } = req.body;
  const booking = await bookingService.createBooking({
    resourceId,
    bookedBy: req.user.userId,
    startTime,
    endTime,
  });
  res.status(201).json(booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await bookingService.cancelBooking(Number(bookingId));
  res.json(booking);
});

module.exports = { createBooking, cancelBooking };
