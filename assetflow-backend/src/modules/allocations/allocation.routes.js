const express = require('express');
const controller = require('./allocation.controller');
const requireAuth = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole('ADMIN', 'ASSET_ADMIN', 'DEPT_MANAGER'), controller.allocateAsset);
router.post('/:allocationId/return', requireRole('ADMIN', 'ASSET_ADMIN', 'DEPT_MANAGER'), controller.returnAsset);

module.exports = router;
