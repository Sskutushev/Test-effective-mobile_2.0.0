import prisma from '../utils/prismaClient'; // Импортируем экземпляр Prisma Client для взаимодействия с БД.
import { ApiError } from '../middlewares/errorMiddleware'; // Пользовательский класс ошибок API.
import * as Prisma from '@prisma/client'; // Импортируем все типы и перечисления из Prisma Client как пространство имен Prisma.

// Сервис для бизнес-логики, связанной с управлением пользователями.
class UserService {
  /**
   * Получает информацию о пользователе по его ID.
   * @param id ID пользователя.
   * @returns Объект пользователя без чувствительных данных (пароль, refresh токен).
   * @throws ApiError.NotFoundError если пользователь не найден.
   */
  async getUserById(id: number): Promise<Omit<Prisma.User, 'password' | 'refreshToken'>> {
    // Ищем пользователя в БД по ID, выбирая только безопасные поля.
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.NotFoundError('Пользователь не найден');
    }
    return user;
  }

  /**
   * Получает список всех пользователей.
   * @returns Массив объектов пользователей без чувствительных данных.
   */
  async getAllUsers(): Promise<Omit<Prisma.User, 'password' | 'refreshToken'>[]> {
    // Получаем всех пользователей из БД, выбирая только безопасные поля.
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return users;
  }

  /**
   * Блокирует пользователя.
   * @param userIdToBlock ID пользователя, которого нужно заблокировать.
   * @param adminId ID администратора, выполняющего блокировку (для проверки логики).
   * @returns Объект заблокированного пользователя с обновленным статусом.
   * @throws ApiError.NotFoundError если пользователь для блокировки не найден.
   * @throws ApiError.ForbiddenError если администратор пытается заблокировать единственного активного администратора или самого себя.
   */
  async blockUser(userIdToBlock: number, adminId: number): Promise<Omit<Prisma.User, 'password' | 'refreshToken'>> {
    // Ищем пользователя, которого нужно заблокировать.
    const userToBlock = await prisma.user.findUnique({ where: { id: userIdToBlock } });
    if (!userToBlock) {
      throw ApiError.NotFoundError('Пользователь для блокировки не найден');
    }

    // Специальная проверка: нельзя заблокировать единственного активного администратора.
    if (userToBlock.role === Prisma.Role.ADMIN) {
      const adminUsers = await prisma.user.findMany({ where: { role: Prisma.Role.ADMIN, status: Prisma.UserStatus.ACTIVE } });
      // Если это единственный активный администратор, запрещаем блокировку.
      if (adminUsers.length === 1 && adminUsers[0].id === userIdToBlock) {
        throw ApiError.ForbiddenError('Нельзя заблокировать единственного активного администратора');
      }
    }

    // Обновляем статус пользователя на BLOCKED.
    const updatedUser = await prisma.user.update({
      where: { id: userIdToBlock },
      data: { status: Prisma.UserStatus.BLOCKED },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return updatedUser;
  }
}

export default new UserService();