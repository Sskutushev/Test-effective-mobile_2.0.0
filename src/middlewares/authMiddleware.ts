import { Request, Response, NextFunction } from 'express'; // Импортируем необходимые типы из Express.
import { ApiError } from './errorMiddleware'; // Импортируем наш пользовательский класс ошибок.
import { validateAccessToken } from '../utils/jwtUtils'; // Импортируем функцию для валидации Access Token.
import prisma from '../utils/prismaClient'; // Импортируем экземпляр Prisma Client для работы с базой данных.

/**
 * Middleware для аутентификации пользователя по Access Token.
 * Извлекает токен из заголовка Authorization, валидирует его и добавляет информацию о пользователе в объект запроса (req.user).
 * @param req Объект запроса Express.
 * @param res Объект ответа Express.
 * @param next Функция для передачи управления следующему middleware.
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Получаем заголовок Authorization.
    const authorizationHeader = req.headers.authorization;
    // Если заголовок отсутствует, пользователь не авторизован.
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    // Извлекаем Access Token из заголовка (формат: 'Bearer TOKEN').
    const accessToken = authorizationHeader.split(' ')[1];
    // Если токен отсутствует после разделения, пользователь не авторизован.
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    // Валидируем Access Token.
    const userData = validateAccessToken(accessToken);
    // Если токен недействителен (истек, подделан и т.д.), пользователь не авторизован.
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    // Ищем пользователя в базе данных по userId из токена.
    const user = await prisma.user.findUnique({ where: { id: userData.userId } });
    // Если пользователь не найден в БД (например, удален), пользователь не авторизован.
    if (!user) {
      return next(ApiError.UnauthorizedError());
    }

    // Добавляем информацию о пользователе в объект запроса для дальнейшего использования в контроллерах.
    // req.user расширен в src/types/express.d.ts.
    req.user = { userId: user.id, email: user.email, role: user.role };
    // Передаем управление следующему middleware или обработчику маршрута.
    next();
  } catch (e) {
    // В случае любой ошибки в процессе аутентификации, считаем пользователя неавторизованным.
    return next(ApiError.UnauthorizedError());
  }
};