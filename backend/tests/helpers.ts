import jwt from 'jsonwebtoken';

export function createAuthToken(userId = 1, email = 'test@example.com') {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET || 'test-secret');
}
