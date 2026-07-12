const express = require('express');
const controller = require('./asset.controller');
const requireAuth = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');

const router = express.Router();

router.use(requireAuth); // every route below requires login

router.get('/', controller.listAssets);
router.post('/', requireRole('ADMIN', 'ASSET_ADMIN'), controller.createAsset);

module.exports = router;
