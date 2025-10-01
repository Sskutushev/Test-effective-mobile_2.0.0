/**
 * @file Определение маршрутов аутентификации.
 * @description Содержит маршруты для регистрации, входа, обновления токена и выхода пользователей.
 * Использует express-validator для валидации входных данных.
 */

import { Router } from 'express'; // Импортируем Router из Express для создания маршрутов.
import authController from '../controllers/authController'; // Импортируем контроллер аутентификации.
import { body } from 'express-validator'; // Импортируем функцию body из express-validator для валидации тела запроса.
import { validationMiddleware } from '../middlewares/validationMiddleware'; // Импортируем middleware для обработки ошибок валидации.

/**
 * @section Инициализация маршрутизатора
 * @description Создаем новый экземпляр маршрутизатора Express для обработки маршрутов аутентификации.
 */
const router = Router();

/**
 * @section Маршруты аутентификации
 * @description Определяет HTTP-методы, пути и обработчики для операций аутентификации.
 */

/**
 * @route POST /api/auth/register
 * @description Маршрут для регистрации нового пользователя.
 * Включает валидацию входных данных с помощью express-validator.
 */
router.post(
  '/register',
  // Валидация полей запроса для регистрации.
  body('email').isEmail().withMessage('Некорректный email'), // Валидация поля 'email': должен быть валидным email.
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'), // Валидация поля 'password': должен быть не менее 6 символов.
  body('fullName').notEmpty().withMessage('ФИО обязательно'), // Валидация поля 'fullName': не должно быть пустым.
  body('birthDate').isISO8601().toDate().withMessage('Некорректная дата рождения (ожидается формат YYYY-MM-DD)'), // Валидация поля 'birthDate': должен быть в формате ISO8601 и быть валидной датой.
  validationMiddleware, // Middleware для обработки результатов валидации. Если есть ошибки, он их перехватит.
  authController.register // Обработчик запроса из authController.
);

/**
 * @route POST /api/auth/login
 * @description Маршрут для входа пользователя в систему.
 * Включает валидацию email и пароля.
 */
router.post(
  '/login',
  // Валидация полей запроса для входа.
  body('email').isEmail().withMessage('Некорректный email'), // Валидация поля 'email': должен быть валидным email.
  body('password').notEmpty().withMessage('Пароль обязателен'), // Валидация поля 'password': не должно быть пустым.
  validationMiddleware, // Middleware для обработки результатов валидации.
  authController.login // Обработчик запроса из authController.
);

/**
 * @route POST /api/auth/refresh
 * @description Маршрут для обновления Access Token с использованием Refresh Token.
 * Refresh Token ожидается в HTTP-only cookie.
 */
router.post('/refresh', authController.refresh);

/**
 * @route POST /api/auth/logout
 * @description Маршрут для выхода пользователя из системы.
 * Удаляет Refresh Token из базы данных и очищает cookie.
 */
router.post('/logout', authController.logout);

// Экспортируем маршрутизатор для использования в основном приложении Express.
export default router;