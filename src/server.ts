import express from 'express';

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

// --- Применение Middleware --- //

// Middleware для парсинга JSON-тел запросов. Позволяет Express читать JSON, отправленный клиентом.
app.use(express.json());
// Middleware для парсинга Cookie. Позволяет легко получать доступ к кукам в req.cookies.
app.use(cookieParser());
// Middleware для настройки CORS. Разрешает запросы с определенных доменов (или всех в режиме разработки).
// credentials: true позволяет отправлять куки и заголовки авторизации.
// origin: process.env.CLIENT_URL || 'http://localhost:3000' указывает разрешенный источник запросов.
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
// Middleware Helmet для установки безопасных HTTP-заголовков, таких как X-Content-Type-Options, X-Frame-Options и других.
app.use(helmet());

// --- Подключение маршрутов API --- //

// Подключение маршрутов аутентификации. Все маршруты в authRoutes будут доступны по префиксу /api/auth.
app.use('/api/auth', authRoutes);
// Подключение маршрутов пользователей. Все маршруты в userRoutes будут доступны по префиксу /api.
app.use('/api', userRoutes);

// --- Обработка ошибок --- //

// Глобальный обработчик ошибок. Должен быть подключен последним, после всех маршрутов и других middleware,
// чтобы перехватывать любые ошибки, возникшие в процессе обработки запроса.
app.use(errorMiddleware);

// --- Запуск сервера --- //

// Асинхронная функция для запуска Express-сервера.
const start = async () => {
  try {
    // Запуск сервера на указанном порту.
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    startBot(); // Запуск телеграм-бота
  } catch (e) {
    // В случае ошибки при запуске сервера, выводим ее в консоль.
    console.error(e);
  }
};

// Вызов функции для запуска сервера.
start();