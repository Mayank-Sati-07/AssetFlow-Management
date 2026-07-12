
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');


async function createAccount({ employeeId, username, password, role }) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    throw new ApiError(404, 'Employee not found — create the employee record first');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { employeeId, username, passwordHash, role },
  });

  return { id: user.id, username: user.username, role: user.role };
}

async function login({ username, password }) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const token = jwt.sign(
    { userId: user.id, employeeId: user.employeeId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, role: user.role };
}

module.exports = { createAccount, login };
