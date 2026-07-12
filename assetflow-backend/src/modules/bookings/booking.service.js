const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');

// Overlap logic explained simply:
// Two time ranges [startA, endA] and [startB, endB] overlap if
//    startA < endB  AND  endA > startB
// We ask the database: "find me any CONFIRMED booking for this resource
// where that condition is true" — if we find even one, it's a conflict.
async function checkOverlap(resourceId, startTime, endTime) {
  const conflict = await prisma.booking.findFirst({
    where: {
      resourceId,
      status: 'CONFIRMED',
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  return conflict;
}

async function createBooking({ resourceId, bookedBy, startTime, endTime }) {
  if (new Date(startTime) >= new Date(endTime)) {
    throw new ApiError(400, 'Start time must be before end time');
  }

  const conflict = await checkOverlap(resourceId, new Date(startTime), new Date(endTime));
  if (conflict) {
    throw new ApiError(
      409,
      `This resource is already booked from ${conflict.startTime.toISOString()} to ${conflict.endTime.toISOString()}`
    );
  }

  return prisma.booking.create({
    data: { resourceId, bookedBy, startTime: new Date(startTime), endTime: new Date(endTime) },
  });
}

async function cancelBooking(bookingId) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });
}

module.exports = { createBooking, cancelBooking };
