import dotenv from 'dotenv'; // Импортируем библиотеку dotenv для работы с переменными окружения.

dotenv.config(); // Загружаем переменные окружения из файла .env в process.env.

// Экспортируем порт сервера. Если переменная окружения PORT не установлена, по умолчанию используется 5000.
export const PORT = process.env.PORT || 5000;

// Экспортируем секретный ключ для Access Token JWT.
// Если JWT_ACCESS_SECRET не установлен, используется значение по умолчанию 'supersecretaccess'.
// В продакшене ОБЯЗАТЕЛЬНО используйте надежный, случайный ключ.
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'supersecretaccess';

// Экспортируем секретный ключ для Refresh Token JWT.
// Если JWT_REFRESH_SECRET не установлен, используется значение по умолчанию 'supersecretrefresh'.
// В продакшене ОБЯЗАТЕЛЬНО используйте надежный, случайный ключ.
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefresh';

// Экспортируем URL для подключения к базе данных PostgreSQL.
// Если DATABASE_URL не установлен, используется строка подключения по умолчанию.
// Эта строка подключения должна соответствовать настройкам вашего Docker-контейнера PostgreSQL.
export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/effective_mobile_db?schema=public";