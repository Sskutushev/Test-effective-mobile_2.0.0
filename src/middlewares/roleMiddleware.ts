import { Request, Response, NextFunction } from 'express'; // Импортируем необходимые типы из Express.
import { ApiError } from './errorMiddleware'; // Импортируем наш пользовательский класс ошибок.
import * as Prisma from '@prisma/client'; // Импортируем все типы и перечисления из Prisma Client как пространство имен Prisma.

/**
 * Middleware для проверки роли пользователя.
 * Создает middleware-функцию, которая проверяет, соответствует ли роль аутентифицированного пользователя требуемой роли.
 * @param requiredRole Требуемая роль (например, Prisma.Role.ADMIN).
 * @returns Middleware-функция Express.
 */
export const roleMiddleware = (requiredRole: Prisma.Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Проверяем, что информация о пользователе присутствует в запросе (т.е. пользователь аутентифицирован).
      if (!req.user) {
        return next(ApiError.UnauthorizedError()); // Если нет, пользователь не авторизован.
      }

      // Проверяем, соответствует ли роль пользователя требуемой роли.
      if (req.user.role !== requiredRole) {
        return next(ApiError.ForbiddenError()); // Если нет, у пользователя недостаточно прав.
      }
      // Если роль соответствует, передаем управление следующему middleware или обработчику маршрута.
      next();
    } catch (e) {
      // В случае любой ошибки в процессе проверки роли, считаем, что у пользователя недостаточно прав.
      return next(ApiError.ForbiddenError());
    }
  };
};