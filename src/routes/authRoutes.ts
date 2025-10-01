import { Router } from 'express'; // Импортируем Router из Express для создания маршрутов.
import authController from '../controllers/authController'; // Импортируем контроллер аутентификации.
import { body } from 'express-validator'; // Импортируем функцию body из express-validator для валидации тела запроса.
import { validationMiddleware } from '../middlewares/validationMiddleware'; // Импортируем middleware для обработки ошибок валидации.

// Создаем новый экземпляр маршрутизатора Express.
const router = Router();

// --- Маршруты аутентификации --- //

/**
 * POST /api/auth/register
 * Маршрут для регистрации нового пользователя.
 * Включает валидацию входных данных с помощью express-validator.
 */
router.post(
  '/register',
  // Валидация поля 'email': должен быть валидным email.
  body('email').isEmail().withMessage('Некорректный email'),
  // Валидация поля 'password': должен быть не менее 6 символов.
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
  // Валидация поля 'fullName': не должно быть пустым.
  body('fullName').notEmpty().withMessage('ФИО обязательно'),
  // Валидация поля 'birthDate': должен быть в формате ISO8601 и быть валидной датой.
  body('birthDate').isISO8601().toDate().withMessage('Некорректная дата рождения (ожидается формат YYYY-MM-DD)'),
  // Middleware для обработки результатов валидации. Если есть ошибки, он их перехватит.
  validationMiddleware,
  // Обработчик запроса из authController.
  authController.register
);

/**
 * POST /api/auth/login
 * Маршрут для входа пользователя в систему.
 * Включает валидацию email и пароля.
 */
router.post(
  '/login',
  // Валидация поля 'email': должен быть валидным email.
  body('email').isEmail().withMessage('Некорректный email'),
  // Валидация поля 'password': не должно быть пустым.
  body('password').notEmpty().withMessage('Пароль обязателен'),
  // Middleware для обработки результатов валидации.
  validationMiddleware,
  // Обработчик запроса из authController.
  authController.login
);

/**
 * POST /api/auth/refresh
 * Маршрут для обновления Access Token с использованием Refresh Token.
 * Refresh Token ожидается в HTTP-only cookie.
 */
router.post('/refresh', authController.refresh);

/**
 * POST /api/auth/logout
 * Маршрут для выхода пользователя из системы.
 * Удаляет Refresh Token из базы данных и очищает cookie.
 */
router.post('/logout', authController.logout);

// Экспортируем маршрутизатор для использования в основном приложении Express.
export default router;