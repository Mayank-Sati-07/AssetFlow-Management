const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const assetService = require('../assets/asset.service');

// Step 1: anyone can RAISE a request. This does NOT touch the asset's state yet —
// that's the whole point of an approval workflow, nothing happens until someone approves it.
async function raiseRequest({ assetId, raisedBy, description }) {
  return prisma.maintenanceRequest.create({
    data: { assetId, raisedBy, description, status: 'PENDING_APPROVAL' },
  });
}

// Step 2: only a manager/admin can approve. Approving is the moment the asset
// actually moves to UNDER_MAINTENANCE — wrapped in a transaction so the request
// status and the asset state change together or not at all.
async function approveRequest({ requestId, approvedBy }) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'PENDING_APPROVAL') {
      throw new ApiError(404, 'Pending maintenance request not found');
    }

    await tx.maintenanceRequest.update({
      where: { id: requestId },
      data: { status: 'IN_PROGRESS', approvedBy },
    });

    await assetService.transitionState(request.assetId, 'UNDER_MAINTENANCE', approvedBy, 'Maintenance approved', tx);

    return { message: 'Request approved, asset moved to maintenance' };
  });
}

async function rejectRequest({ requestId }) {
  return prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' },
  });
}

// Step 3: maintenance staff mark it resolved -> asset goes back to AVAILABLE.
async function resolveRequest({ requestId, resolvedBy }) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'IN_PROGRESS') {
      throw new ApiError(404, 'In-progress maintenance request not found');
    }

    await tx.maintenanceRequest.update({
      where: { id: requestId },
      data: { status: 'RESOLVED' },
    });

    await assetService.transitionState(request.assetId, 'AVAILABLE', resolvedBy, 'Maintenance resolved', tx);

    return { message: 'Maintenance resolved, asset is available again' };
  });
}

module.exports = { raiseRequest, approveRequest, rejectRequest, resolveRequest };
