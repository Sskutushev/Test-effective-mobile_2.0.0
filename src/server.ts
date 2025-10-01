/**
 * @file Главный файл сервера Express.
 * @description Настраивает и запускает Express-приложение, подключает middleware, маршруты API и глобальный обработчик ошибок.
 * Также инициализирует Telegram-бота.
 */

import express from 'express';

// --- Импорты модулей и конфигурации ---
import cors from 'cors'; // Middleware для разрешения Cross-Origin Resource Sharing (CORS) запросов.
import helmet from 'helmet'; // Набор middleware для защиты Express-приложений путем установки различных HTTP-заголовков.
import cookieParser from 'cookie-parser'; // Middleware для парсинга заголовков Cookie.
import { PORT } from './config/env'; // Импорт порта сервера из файла конфигурации окружения.
import authRoutes from './routes/authRoutes'; // Маршруты, связанные с аутентификацией (регистрация, вход, обновление токена, выход).
import userRoutes from './routes/userRoutes'; // Маршруты, связанные с управлением пользователями (получение, блокировка).
import { errorMiddleware } from './middlewares/errorMiddleware'; // Глобальный обработчик ошибок.
import { startBot } from './bot'; // Импорт функции для запуска бота.

// Создание экземпляра Express-приложения.
const app = express();

/**
 * @section Настройка Middleware
 * @description Применение промежуточного ПО для обработки запросов, парсинга данных, обеспечения безопасности и CORS.
 */
app.use(express.json()); // Middleware для парсинга JSON-тел запросов. Позволяет Express читать JSON, отправленный клиентом.
app.use(cookieParser()); // Middleware для парсинга Cookie. Позволяет легко получать доступ к кукам в req.cookies.
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || 'http://localhost:3000' })); // Middleware для настройки CORS. Разрешает запросы с определенных доменов (или всех в режиме разработки).
app.use(helmet()); // Middleware Helmet для установки безопасных HTTP-заголовков, таких как X-Content-Type-Options, X-Frame-Options и других.

/**
 * @section Подключение маршрутов API
 * @description Определение конечных точек API и привязка их к соответствующим обработчикам.
 */
app.use('/api/auth', authRoutes); // Подключение маршрутов аутентификации. Все маршруты в authRoutes будут доступны по префиксу /api/auth.
app.use('/api', userRoutes); // Подключение маршрутов пользователей. Все маршруты в userRoutes будут доступны по префиксу /api.

/**
 * @section Обработка ошибок
 * @description Глобальный обработчик ошибок, который перехватывает и обрабатывает все ошибки, возникающие в приложении.
 * Должен быть подключен последним.
 */
app.use(errorMiddleware);

/**
 * @section Запуск сервера
 * @description Асинхронная функция для инициализации и запуска Express-сервера и Telegram-бота.
 */
const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); // Запуск сервера на указанном порту.
    startBot(); // Запуск телеграм-бота
  } catch (e) {
    console.error(e); // В случае ошибки при запуске сервера, выводим ее в консоль.
  }
};

// Вызов функции для запуска сервера.
start();