import { Request, Response, NextFunction } from 'express'; // Импортируем необходимые типы из Express.
import { validationResult } from 'express-validator'; // Импортируем validationResult для сбора ошибок валидации.
import { ApiError } from './errorMiddleware'; // Импортируем наш пользовательский класс ошибок.

/**
 * Middleware для обработки результатов валидации запросов.
 * Используется после цепочки валидаторов из express-validator.
 * Если найдены ошибки валидации, генерирует ApiError.BadRequest.
 * @param req Объект запроса Express.
 * @param res Объект ответа Express.
 * @param next Функция для передачи управления следующему middleware.
 */
export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Собираем результаты валидации из объекта запроса.
  const errors = validationResult(req);
  // Если есть ошибки валидации (массив ошибок не пуст).
  if (!errors.isEmpty()) {
    // Передаем ошибку в глобальный обработчик ошибок, используя ApiError.BadRequest.
    // errors.array() преобразует объект ошибок в удобный массив.
    return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
  }
  // Если ошибок нет, передаем управление следующему middleware или обработчику маршрута.
  next();
};