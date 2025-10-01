import { hashPassword, comparePassword } from '../../src/utils/passwordUtils';

describe('passwordUtils', () => {
  it('should hash a password correctly', async () => {
    const password = 'mysecretpassword';
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toEqual(password);
  });

  it('should compare a password with its hash correctly', async () => {
    const password = 'mysecretpassword';
    const hashedPassword = await hashPassword(password);
    const isMatch = await comparePassword(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should return false for incorrect password comparison', async () => {
    const password = 'mysecretpassword';
    const hashedPassword = await hashPassword(password);
    const isMatch = await comparePassword('wrongpassword', hashedPassword);
    expect(isMatch).toBe(false);
  });
});
