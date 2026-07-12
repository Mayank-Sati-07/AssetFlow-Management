const maintenanceService = require('./maintenance.service');
const asyncHandler = require('../../utils/asyncHandler');

const raiseRequest = asyncHandler(async (req, res) => {
  const { assetId, description } = req.body;
  const request = await maintenanceService.raiseRequest({
    assetId,
    raisedBy: req.user.userId,
    description,
  });
  res.status(201).json(request);
});

const approveRequest = asyncHandler(async (req, res) => {
  const result = await maintenanceService.approveRequest({
    requestId: Number(req.params.requestId),
    approvedBy: req.user.userId,
  });
  res.json(result);
});

const rejectRequest = asyncHandler(async (req, res) => {
  const result = await maintenanceService.rejectRequest({
    requestId: Number(req.params.requestId),
  });
  res.json(result);
});

const resolveRequest = asyncHandler(async (req, res) => {
  const result = await maintenanceService.resolveRequest({
    requestId: Number(req.params.requestId),
    resolvedBy: req.user.userId,
  });
  res.json(result);
});

module.exports = { raiseRequest, approveRequest, rejectRequest, resolveRequest };
