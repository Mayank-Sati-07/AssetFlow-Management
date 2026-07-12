const allocationService = require('./allocation.service');
const asyncHandler = require('../../utils/asyncHandler');

const allocateAsset = asyncHandler(async (req, res) => {
  const { assetId, employeeId, expectedReturnAt } = req.body;
  const allocation = await allocationService.allocateAsset({
    assetId,
    employeeId,
    allocatedBy: req.user.userId,
    expectedReturnAt,
  });
  res.status(201).json(allocation);
});

const returnAsset = asyncHandler(async (req, res) => {
  const { allocationId } = req.params;
  const result = await allocationService.returnAsset({
    allocationId: Number(allocationId),
    returnedBy: req.user.userId,
  });
  res.json(result);
});

module.exports = { allocateAsset, returnAsset };
