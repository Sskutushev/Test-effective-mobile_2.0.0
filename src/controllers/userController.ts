import { Request, Response, NextFunction } from 'express'; // Импортируем необходимые типы из Express.
import userService from '../services/userService'; // Импортируем сервис для работы с пользователями.
import { ApiError } from '../middlewares/errorMiddleware'; // Импортируем пользовательский класс ошибок API.
import * as Prisma from '@prisma/client'; // Импортируем все типы и перечисления из Prisma Client как пространство имен Prisma.

// Контроллер для обработки запросов, связанных с управлением пользователями.
class UserController {
  /**
   * Обрабатывает запрос на получение информации о пользователе по ID.
   * Требуется аутентификация. Администратор может получить любого пользователя, обычный пользователь - только себя.
   * @param req Объект запроса Express, содержащий ID пользователя в параметрах маршрута (req.params.id).
   * @param res Объект ответа Express.
   * @param next Функция для передачи управления следующему middleware.
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      // Парсим ID пользователя из параметров маршрута.
      const id = parseInt(req.params.id);
      // Проверяем, является ли ID валидным числом.
      if (isNaN(id)) {
        return next(ApiError.BadRequest('Невалидный ID пользователя'));
      }

      // Проверяем права доступа: либо пользователь - ADMIN, либо запрашивает свои данные.
      if (req.user?.role !== Prisma.Role.ADMIN && req.user?.userId !== id) {
        return next(ApiError.ForbiddenError('Недостаточно прав для просмотра этого пользователя'));
      }

      // Вызываем сервис для получения пользователя.
      const user = await userService.getUserById(id);
      // Отправляем данные пользователя.
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Обрабатывает запрос на получение списка всех пользователей.
   * Требуется аутентификация и роль ADMIN.
   * @param req Объект запроса Express.
   * @param res Объект ответа Express.
   * @param next Функция для передачи управления следующему middleware.
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      // Вызываем сервис для получения всех пользователей.
      const users = await userService.getAllUsers();
      // Отправляем список пользователей.
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Обрабатывает запрос на блокировку пользователя.
   * Требуется аутентификация и роль ADMIN.
   * @param req Объект запроса Express, содержащий ID пользователя для блокировки в параметрах маршрута.
   * @param res Объект ответа Express.
   * @param next Функция для передачи управления следующему middleware.
   */
  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      // Парсим ID пользователя для блокировки.
      const id = parseInt(req.params.id);
      // Проверяем, является ли ID валидным числом.
      if (isNaN(id)) {
        return next(ApiError.BadRequest('Невалидный ID пользователя'));
      }

      // Проверяем, что блокировку выполняет администратор.
      if (req.user?.role !== Prisma.Role.ADMIN) {
        return next(ApiError.ForbiddenError('Только администраторы могут блокировать пользователей'));
      }

      // Администратор не может заблокировать сам себя.
      if (req.user.userId === id) {
        return next(ApiError.ForbiddenError('Администратор не может заблокировать сам себя'));
      }

      // Вызываем сервис для блокировки пользователя.
      const blockedUser = await userService.blockUser(id, req.user.userId);
      // Отправляем успешный ответ с ID и новым статусом заблокированного пользователя.
      return res.json({ message: 'Пользователь успешно заблокирован', user: { id: blockedUser.id, status: blockedUser.status } });
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();