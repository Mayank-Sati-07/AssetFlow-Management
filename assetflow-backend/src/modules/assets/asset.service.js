// This is the ONLY place in the entire codebase allowed to change an asset's state.
// Every other module (allocation, booking, maintenance) calls transitionState()
// instead of writing directly to the database — that's what makes illegal states
// (like "allocated AND under maintenance") impossible.

const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');

// The map from the state-machine diagram, written as plain data.
// Key = current state, value = list of states it's allowed to move to.
const ALLOWED_TRANSITIONS = {
  AVAILABLE: ['ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED'],
  ALLOCATED: ['AVAILABLE', 'LOST'],
  RESERVED: ['AVAILABLE'],
  UNDER_MAINTENANCE: ['AVAILABLE'],
  LOST: ['RETIRED'],
  RETIRED: ['DISPOSED'],
  DISPOSED: [], // terminal — nothing can leave this state
};

async function createAsset({ assetTag, categoryId }) {
  return prisma.asset.create({ data: { assetTag, categoryId } });
}

async function listAssets() {
  return prisma.asset.findMany({ include: { category: true } });
}

// changedBy = the userId making the change, for the audit trail.
// tx = optional Prisma transaction client, so other services (allocation, booking)
// can call this INSIDE their own transaction and have it all succeed or fail together.
async function transitionState(assetId, toState, changedBy, reason, tx = prisma) {
  const asset = await tx.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  const allowed = ALLOWED_TRANSITIONS[asset.state] || [];
  if (!allowed.includes(toState)) {
    throw new ApiError(
      409,
      `Cannot move asset from ${asset.state} to ${toState}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`
    );
  }

  const updated = await tx.asset.update({
    where: { id: assetId },
    data: { state: toState },
  });

  await tx.assetStateLog.create({
    data: {
      assetId,
      fromState: asset.state,
      toState,
      changedBy,
      reason,
    },
  });

  return updated;
}

module.exports = { createAsset, listAssets, transitionState, ALLOWED_TRANSITIONS };
