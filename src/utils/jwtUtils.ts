import jwt from 'jsonwebtoken'; // Импортируем библиотеку jsonwebtoken для работы с JWT.
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../config/env'; // Импортируем секретные ключи из файла конфигурации окружения.

// Интерфейс, описывающий структуру данных, которые будут храниться в JWT-токене.
interface TokenPayload {
  userId: number; // ID пользователя.
  email: string; // Email пользователя.
  role: string; // Роль пользователя (например, 'ADMIN', 'USER').
}

/**
 * Генерирует Access Token (токен доступа).
 * Access Token используется для аутентификации пользователя при доступе к защищенным ресурсам.
 * Срок действия: 15 минут.
 * @param payload Данные, которые будут закодированы в токене.
 * @returns Сгенерированный Access Token.
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

/**
 * Генерирует Refresh Token (токен обновления).
 * Refresh Token используется для получения нового Access Token после истечения срока его действия.
 * Срок действия: 7 дней. Хранится в базе данных для отслеживания сессий.
 * @param payload Данные, которые будут закодированы в токене.
 * @returns Сгенерированный Refresh Token.
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Валидирует Access Token.
 * Проверяет подлинность токена и срок его действия.
 * @param token Access Token для валидации.
 * @returns Декодированные данные из токена (TokenPayload) в случае успеха, иначе null.
 */
export const validateAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Валидирует Refresh Token.
 * Проверяет подлинность токена и срок его действия.
 * @param token Refresh Token для валидации.
 * @returns Декодированные данные из токена (TokenPayload) в случае успеха, иначе null.
 */
export const validateRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};