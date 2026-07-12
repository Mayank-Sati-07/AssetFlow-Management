const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const assetService = require('../assets/asset.service');

// This is the function that guarantees "no double-allocation of a single asset".
//
// The key idea: prisma.$transaction() means every database operation inside the
// callback either ALL succeed or ALL fail together — nothing is left half-done.
// We also re-check the asset's state INSIDE the transaction (not before it),
// so if two people click "allocate" on the same asset at the exact same moment,
// the database itself stops the second one, not just our JavaScript code.
async function allocateAsset({ assetId, employeeId, allocatedBy, expectedReturnAt }) {
  return prisma.$transaction(async (tx) => {
    // 1. Move the asset from AVAILABLE to ALLOCATED (this itself checks the state machine).
    await assetService.transitionState(assetId, 'ALLOCATED', allocatedBy, 'Allocated to employee', tx);

    // 2. Create the allocation record.
    //    The @@unique([assetId, status]) constraint in schema.prisma is the final
    //    safety net: even if our code had a bug, the database would reject a
    //    second ACTIVE allocation row for the same asset.
    try {
      const allocation = await tx.allocation.create({
        data: { assetId, employeeId, allocatedBy, expectedReturnAt, status: 'ACTIVE' },
      });
      return allocation;
    } catch (err) {
      if (err.code === 'P2002') {
        // P2002 = Prisma's "unique constraint violated" error code
        throw new ApiError(409, 'This asset already has an active allocation');
      }
      throw err;
    }
  });
}

async function returnAsset({ allocationId, returnedBy }) {
  return prisma.$transaction(async (tx) => {
    const allocation = await tx.allocation.findUnique({ where: { id: allocationId } });
    if (!allocation || allocation.status !== 'ACTIVE') {
      throw new ApiError(404, 'Active allocation not found');
    }

    await tx.allocation.update({
      where: { id: allocationId },
      data: { status: 'RETURNED', returnedAt: new Date() },
    });

    await assetService.transitionState(allocation.assetId, 'AVAILABLE', returnedBy, 'Returned', tx);

    return { message: 'Asset returned successfully' };
  });
}

module.exports = { allocateAsset, returnAsset };
