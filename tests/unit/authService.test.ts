import authService from '../../src/services/authService';
import prisma from '../../src/utils/prismaClient';
import { hashPassword, comparePassword } from '../../src/utils/passwordUtils';
import { generateAccessToken, generateRefreshToken } from '../../src/utils/jwtUtils';
import { ApiError } from '../../src/middlewares/errorMiddleware';

jest.mock('@prisma/client');

enum Role { ADMIN = 'ADMIN', USER = 'USER' }
enum UserStatus { ACTIVE = 'ACTIVE', BLOCKED = 'BLOCKED' }

interface User {
  id: number;
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Mock PrismaClient
jest.mock('../../src/utils/prismaClient', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock passwordUtils
jest.mock('../../src/utils/passwordUtils', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

// Mock jwtUtils
jest.mock('../../src/utils/jwtUtils', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  validateRefreshToken: jest.fn(),
}));

describe('AuthService', () => {
  const mockUser: User = {
    id: 1,
    fullName: 'Test User',
    birthDate: new Date('2000-01-01'),
    email: 'test@example.com',
    password: 'hashedpassword',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedpassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (generateAccessToken as jest.Mock).mockReturnValue('accessToken');
      (generateRefreshToken as jest.Mock).mockReturnValue('refreshToken');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const { user, tokens } = await authService.register(
        mockUser.fullName,
        mockUser.birthDate,
        mockUser.email,
        'password123'
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockUser.email } });
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          email: mockUser.email,
          password: 'hashedpassword',
        }),
      }));
      expect(user.email).toBe(mockUser.email);
      expect(tokens.accessToken).toBe('accessToken');
      expect(tokens.refreshToken).toBe('refreshToken');
    });

    it('should throw ApiError.ConflictError if user with email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.register(mockUser.fullName, mockUser.birthDate, mockUser.email, 'password123')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockReturnValue('accessToken');
      (generateRefreshToken as jest.Mock).mockReturnValue('refreshToken');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const { user, tokens } = await authService.login(mockUser.email, 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockUser.email } });
      expect(comparePassword).toHaveBeenCalledWith('password123', mockUser.password);
      expect(user.email).toBe(mockUser.email);
      expect(tokens.accessToken).toBe('accessToken');
      expect(tokens.refreshToken).toBe('refreshToken');
    });

    it('should throw ApiError.BadRequest if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(mockUser.email, 'password123')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError.BadRequest if password is incorrect', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(mockUser.email, 'wrongpassword')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError.ForbiddenError if user is blocked', async () => {
      const blockedUser = { ...mockUser, status: UserStatus.BLOCKED };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(blockedUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      await expect(authService.login(mockUser.email, 'password123')).rejects.toThrow(ApiError);
    });
  });

  describe('refresh', () => {
    it('should refresh access token successfully', async () => {
      const oldRefreshToken = 'oldRefreshToken';
      const decodedUserData = { userId: mockUser.id, email: mockUser.email, role: mockUser.role };
      (generateAccessToken as jest.Mock).mockReturnValue('newAccessToken');
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (generateRefreshToken as jest.Mock).mockReturnValue('newRefreshToken');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      // Mock validateRefreshToken to return decoded data
      jest.spyOn(require('../../src/utils/jwtUtils'), 'validateRefreshToken').mockReturnValue(decodedUserData);

      const { accessToken } = await authService.refresh(oldRefreshToken);

      expect(require('../../src/utils/jwtUtils').validateRefreshToken).toHaveBeenCalledWith(oldRefreshToken);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { refreshToken: oldRefreshToken } });
      expect(accessToken).toBe('newAccessToken');
    });

    it('should throw ApiError.UnauthorizedError if refresh token is invalid', async () => {
      jest.spyOn(require('../../src/utils/jwtUtils'), 'validateRefreshToken').mockReturnValue(null);

      await expect(authService.refresh('invalidRefreshToken')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError.UnauthorizedError if refresh token not found in DB', async () => {
      const decodedUserData = { userId: mockUser.id, email: mockUser.email, role: mockUser.role };
      jest.spyOn(require('../../src/utils/jwtUtils'), 'validateRefreshToken').mockReturnValue(decodedUserData);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.refresh('someRefreshToken')).rejects.toThrow(ApiError);
    });
  });
});
