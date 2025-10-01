import { Request, Response, NextFunction } from 'express'; // Импортируем необходимые типы из Express.

/**
 * Пользовательский класс ошибок для API.
 * Позволяет создавать ошибки с определенным HTTP-статусом и дополнительными деталями.
 */
export class ApiError extends Error {
  status: number; // HTTP-статус ошибки (например, 400, 401, 403).
  errors: any[]; // Массив дополнительных ошибок или деталей валидации.

  /**
   * Конструктор для создания экземпляра ApiError.
   * @param status HTTP-статус ошибки.
   * @param message Сообщение об ошибке.
   * @param errors Опциональный массив дополнительных ошибок.
   */
  constructor(status: number, message: string, errors: any[] = []) {
    super(message); // Вызываем конструктор базового класса Error.
    this.status = status;
    this.errors = errors;
  }

  /**
   * Статический метод для создания ошибки 400 Bad Request.
   * Используется для ошибок валидации или некорректных входных данных.
   * @param message Сообщение об ошибке.
   * @param errors Опциональный массив ошибок валидации.
   */
  static BadRequest(message: string, errors: any[] = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * Статический метод для создания ошибки 401 Unauthorized.
   * Используется, когда пользователь не аутентифицирован или токен недействителен.
   */
  static UnauthorizedError() {
    return new ApiError(401, 'Пользователь не авторизован');
  }

  /**
   * Статический метод для создания ошибки 403 Forbidden.
   * Используется, когда у пользователя недостаточно прав для выполнения действия.
   * @param message Опциональное сообщение об ошибке.
   */
  static ForbiddenError(message: string = 'Недостаточно прав') {
    return new ApiError(403, message);
  }

  /**
   * Статический метод для создания ошибки 404 Not Found.
   * Используется, когда запрашиваемый ресурс не найден.
   * @param message Опциональное сообщение об ошибке.
   */
  static NotFoundError(message: string = 'Ресурс не найден') {
    return new ApiError(404, message);
  }

  /**
   * Статический метод для создания ошибки 409 Conflict.
   * Используется, когда возникает конфликт данных (например, email уже занят).
   * @param message Опциональное сообщение об ошибке.
   */
  static ConflictError(message: string = 'Конфликт данных') {
    return new ApiError(409, message);
  }
}

/**
 * Глобальный middleware для обработки ошибок.
 * Перехватывает все ошибки, возникшие в приложении, и отправляет стандартизированный ответ клиенту.
 * @param err Объект ошибки.
 * @param req Объект запроса Express.
 * @param res Объект ответа Express.
 * @param next Функция для передачи управления следующему middleware.
 */
export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Логируем ошибку для отладки на сервере.
  console.error(err);

  // Если ошибка является экземпляром ApiError, отправляем ответ с соответствующим статусом и сообщением.
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }

  // Для всех остальных необработанных ошибок отправляем стандартный ответ 500 Internal Server Error.
  return res.status(500).json({ message: 'Непредвиденная ошибка сервера' });
};