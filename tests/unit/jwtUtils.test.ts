import { generateAccessToken, generateRefreshToken, validateAccessToken, validateRefreshToken } from '../../src/utils/jwtUtils';
import jwt from 'jsonwebtoken';

describe('jwtUtils', () => {
  const payload = {
    userId: 1,
    email: 'test@example.com',
    role: 'USER',
  };

  it('should generate an access token', () => {
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should generate a refresh token', () => {
    const token = generateRefreshToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should validate a valid access token', () => {
    const token = generateAccessToken(payload);
    const decoded = validateAccessToken(token);
    expect(decoded).toEqual(expect.objectContaining(payload));
  });

  it('should validate a valid refresh token', () => {
    const token = generateRefreshToken(payload);
    const decoded = validateRefreshToken(token);
    expect(decoded).toEqual(expect.objectContaining(payload));
  });

  it('should return null for an invalid access token', () => {
    const invalidToken = 'invalid.token.string';
    const decoded = validateAccessToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it('should return null for an invalid refresh token', () => {
    const invalidToken = 'invalid.token.string';
    const decoded = validateRefreshToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it('should return null for an expired access token', () => {
    const expiredToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'access_secret', { expiresIn: '0s' });
    // Wait for the token to expire
    return new Promise((resolve) => {
      setTimeout(() => {
        const decoded = validateAccessToken(expiredToken);
        expect(decoded).toBeNull();
        resolve(null);
      }, 100);
    });
  });
});
