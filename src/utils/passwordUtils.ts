import * as bcrypt from 'bcrypt'; // Импортируем библиотеку bcrypt для хэширования и сравнения паролей.

// Количество раундов соления для bcrypt. Чем выше значение, тем безопаснее хэш, но тем медленнее процесс.
// 10 - хорошее значение по умолчанию для большинства приложений.
const SALT_ROUNDS = 10;

/**
 * Хэширует переданный пароль с использованием bcrypt.
 * @param password Пароль в виде обычной строки.
 * @returns Промис, который разрешается хэшированной строкой пароля.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Сравнивает переданный пароль с хэшированным паролем.
 * @param password Пароль в виде обычной строки.
 * @param hash Хэшированный пароль для сравнения.
 * @returns Промис, который разрешается в true, если пароли совпадают, иначе false.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};