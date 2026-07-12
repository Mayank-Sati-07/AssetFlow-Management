const express = require('express');
const controller = require('./maintenance.controller');
const requireAuth = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', controller.raiseRequest); // anyone can raise a request
router.post('/:requestId/approve', requireRole('ADMIN', 'DEPT_MANAGER', 'ASSET_ADMIN'), controller.approveRequest);
router.post('/:requestId/reject', requireRole('ADMIN', 'DEPT_MANAGER', 'ASSET_ADMIN'), controller.rejectRequest);
router.post('/:requestId/resolve', requireRole('ADMIN', 'MAINTENANCE_STAFF'), controller.resolveRequest);

module.exports = router;
