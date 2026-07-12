const express = require('express');
const controller = require('./auth.controller');
const requireAuth = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');

const router = express.Router();


router.post('/login', controller.login);

// Protected

router.post('/accounts', requireAuth, requireRole('ADMIN'), controller.createAccount);

module.exports = router;
