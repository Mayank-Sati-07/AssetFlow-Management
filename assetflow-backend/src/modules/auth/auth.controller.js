const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.login({ username, password });
  res.json(result);
});

const createAccount = asyncHandler(async (req, res) => {
  const { employeeId, username, password, role } = req.body;
  const result = await authService.createAccount({ employeeId, username, password, role });
  res.status(201).json(result);
});

module.exports = { login, createAccount };
