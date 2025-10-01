import { Router } from 'express'; // Импортируем Router из Express для создания маршрутов.
import userController from '../controllers/userController'; // Импортируем контроллер для работы с пользователями.
import { authMiddleware } from '../middlewares/authMiddleware'; // Импортируем middleware для аутентификации.
import { roleMiddleware } from '../middlewares/roleMiddleware'; // Импортируем middleware для проверки ролей.
import * as Prisma from '@prisma/client'; // Импортируем все типы и перечисления из Prisma Client как пространство имен Prisma.

// Создаем новый экземпляр маршрутизатора Express.
const router = Router();

// --- Маршруты управления пользователями --- //

/**
 * GET /api/users/:id
 * Маршрут для получения информации о конкретном пользователе по его ID.
 * Защищен middleware аутентификации (authMiddleware).
 * Логика доступа: ADMIN может получить любого пользователя, обычный пользователь - только свои данные.
 */
router.get('/users/:id', authMiddleware, userController.getUserById);

/**
 * GET /api/users
 * Маршрут для получения списка всех пользователей.
 * Защищен middleware аутентификации (authMiddleware) и проверки роли (roleMiddleware).
 * Доступен только пользователям с ролью ADMIN.
 */
router.get('/users', authMiddleware, roleMiddleware(Prisma.Role.ADMIN), userController.getAllUsers);

/**
 * PATCH /api/users/:id/block
 * Маршрут для блокировки пользователя.
 * Защищен middleware аутентификации (authMiddleware) и проверки роли (roleMiddleware).
 * Доступен только пользователям с ролью ADMIN.
 */
router.patch('/users/:id/block', authMiddleware, roleMiddleware(Prisma.Role.ADMIN), userController.blockUser);

// Экспортируем маршрутизатор для использования в основном приложении Express.
export default router;