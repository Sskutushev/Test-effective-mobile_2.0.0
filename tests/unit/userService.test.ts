import userService from '../../src/services/userService';
import prisma from '../../src/utils/prismaClient';
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
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('UserService', () => {
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

  const mockAdminUser: User = {
    ...mockUser,
    id: 2,
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await userService.getUserById(mockUser.id);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: expect.any(Object),
      });
      expect(user.id).toBe(mockUser.id);
      expect(user.email).toBe(mockUser.email);
    });

    it('should throw ApiError.NotFoundError if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById(999)).rejects.toThrow(ApiError);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const usersList = [mockUser, mockAdminUser];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(usersList);

      const users = await userService.getAllUsers();
      expect(prisma.user.findMany).toHaveBeenCalledWith({ select: expect.any(Object) });
      expect(users).toEqual(usersList);
      expect(users.length).toBe(2);
    });
  });

  describe('blockUser', () => {
    it('should block a user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, status: UserStatus.BLOCKED });

      const blockedUser = await userService.blockUser(mockUser.id, mockAdminUser.id);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { status: UserStatus.BLOCKED },
        select: expect.any(Object),
      });
      expect(blockedUser.status).toBe(UserStatus.BLOCKED);
    });

    it('should throw ApiError.NotFoundError if user to block not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.blockUser(999, mockAdminUser.id)).rejects.toThrow(ApiError);
    });

    it('should throw ApiError.ForbiddenError if trying to block the only active admin', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (prisma.user.findMany as jest.Mock).mockResolvedValue([mockAdminUser]); // Only one active admin

      await expect(userService.blockUser(mockAdminUser.id, mockAdminUser.id)).rejects.toThrow(ApiError);
    });
  });
});
