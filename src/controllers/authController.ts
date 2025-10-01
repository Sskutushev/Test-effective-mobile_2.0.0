import { Request, Response, NextFunction } from 'express'; // Импортируем необходимые типы из Express.
import authService from '../services/authService'; // Импортируем сервис аутентификации.
import { validationResult } from 'express-validator'; // Импортируем validationResult для обработки ошибок валидации.
import { ApiError } from '../middlewares/errorMiddleware'; // Импортируем пользовательский класс ошибок API.

// Контроллер для обработки запросов, связанных с аутентификацией.
class AuthController {
  /**
   * Обрабатывает запрос на регистрацию нового пользователя.
   * @param req Объект запроса Express, содержащий данные для регистрации (fullName, birthDate, email, password).
   * @param res Объект ответа Express.
   * @param next Функция для передачи управления следующему middleware.
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Проверяем результаты валидации, выполненной express-validator.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Если есть ошибки валидации, передаем их в обработчик ошибок.
        return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
      }

      // Извлекаем данные из тела запроса.
      const { fullName, birthDate, email, password } = req.body;
      // Вызываем сервис для регистрации пользователя.
      const { user, tokens } = await authService.register(fullName, new Date(birthDate), email, password);
      // Устанавливаем refresh токен в HTTP-only cookie для безопасности.
      res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      // Отправляем успешный ответ с данными пользователя и access токеном.
      return res.json({ message: 'Регистрация успешна', user, accessToken: tokens.accessToken });
    } catch (e) {
      // Передаем любую возникшую ошибку в глобальный обработчик ошибок.
      next(e);
    }
  }

  /**
   * Обрабатывает запрос на вход пользователя.
   * @param req Объект запроса Express, содержащий email и password.
   * @param res Объект ответа Express.
   * @param next Функция для передачи управления следующему middleware.
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Проверяем результаты валидации.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
      }

      // Извлекаем данные из тела запроса.
      const { email, password } = req.body;
      // Вызываем сервис для аутентификации пользователя.
      const { user, tokens } = await authService.login(email, password);
      // Устанавливаем refresh токен в HTTP-only cookie.
      res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      // Отправляем успешный ответ с токенами и данными пользователя.
      return res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Обрабатывает запрос на обновление Access Token с использованием Refresh Token.
   * @param req Объект запроса Express, содержащий refresh токен в cookies.
   * @param res Объект ответа Express.
   * @param next Функция для передачи управления следующему middleware.
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Извлекаем refresh токен из cookies.
      const { refreshToken } = req.cookies;
      // Вызываем сервис для обновления access токена.
      const { accessToken } = await authService.refresh(refreshToken);
      // Отправляем новый access токен.
      return res.json({ accessToken });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Обрабатывает запрос на выход пользователя из системы.
   * @param req Объект запроса Express, содержащий refresh токен в cookies.
   * @param res Объект ответа Express.
   * @param next Функция для передачи управления следующему middleware.
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Извлекаем refresh токен из cookies.
      const { refreshToken } = req.cookies;
      // Вызываем сервис для удаления refresh токена из БД.
      await authService.logout(refreshToken);
      // Очищаем cookie с refresh токеном на стороне клиента.
      res.clearCookie('refreshToken');
      // Отправляем успешный ответ.
      return res.json({ message: 'Выход выполнен успешно' });
    } catch (e) {
      next(e);
    }
  }
}

export default new AuthController();