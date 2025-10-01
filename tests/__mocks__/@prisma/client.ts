export enum Role { ADMIN = 'ADMIN', USER = 'USER' }
export enum UserStatus { ACTIVE = 'ACTIVE', BLOCKED = 'BLOCKED' }

export interface User {
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

// Mock PrismaClient - not strictly necessary for type resolution but good practice
export class PrismaClient {
  user = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  };
  $disconnect = jest.fn();
}

// Export Prisma namespace for types like Prisma.UserCreateInput etc. if needed
export const Prisma = {
  User: {} as User, // Mock User type
  Role: Role, // Export Role enum
  UserStatus: UserStatus, // Export UserStatus enum
  // Add other Prisma types/enums as needed for tests
};
