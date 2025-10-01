import prisma from '../utils/prismaClient'; // Импортируем экземпляр Prisma Client для взаимодействия с БД.
import { hashPassword, comparePassword } from '../utils/passwordUtils'; // Функции для хэширования и сравнения паролей.
import { generateAccessToken, generateRefreshToken, validateRefreshToken } from '../utils/jwtUtils'; // Функции для работы с JWT.
import { ApiError } from '../middlewares/errorMiddleware'; // Пользовательский класс ошибок API.
import * as Prisma from '@prisma/client'; // Импортируем все типы и перечисления из Prisma Client как пространство имен Prisma.

// Интерфейс для возвращаемых токенов.
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Сервис для бизнес-логики аутентификации и авторизации.
class AuthService {
  /**
   * Регистрирует нового пользователя.
   * @param fullName Полное имя пользователя.
   * @param birthDate Дата рождения пользователя.
   * @param email Уникальный email пользователя.
   * @param password Пароль пользователя.
   * @returns Объект с данными пользователя (без пароля и refresh токена) и токенами.
   * @throws ApiError.ConflictError если пользователь с таким email уже существует.
   */
  async register(fullName: string, birthDate: Date, email: string, password: string): Promise<{ user: Omit<Prisma.User, 'password' | 'refreshToken'>; tokens: AuthTokens }> {
    // Проверяем, существует ли пользователь с таким email.
    const candidate = await prisma.user.findUnique({ where: { email } });
    if (candidate) {
      throw ApiError.ConflictError(`Пользователь с почтовым адресом ${email} уже существует`);
    }

    // Хэшируем пароль перед сохранением в БД.
    const hashedPassword = await hashPassword(password);
    // Создаем нового пользователя в БД.
    const user = await prisma.user.create({
      data: {
        fullName,
        birthDate,
        email,
        password: hashedPassword,
        role: Prisma.Role.USER, // По умолчанию роль USER.
        status: Prisma.UserStatus.ACTIVE, // По умолчанию статус ACTIVE.
      },
    });

    // Генерируем и сохраняем токены для нового пользователя.
    const tokens = this.generateAndSaveTokens(user);

    // Удаляем чувствительные данные (пароль, refresh токен) из объекта пользователя перед отправкой клиенту.
    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;
    return { user: userWithoutSensitiveData, tokens };
  }

  /**
   * Аутентифицирует пользователя.
   * @param email Email пользователя.
   * @param password Пароль пользователя.
   * @returns Объект с данными пользователя (без пароля и refresh токена) и токенами.
   * @throws ApiError.BadRequest если пользователь не найден или пароль неверный.
   * @throws ApiError.ForbiddenError если аккаунт пользователя заблокирован.
   */
  async login(email: string, password: string): Promise<{ user: Omit<Prisma.User, 'password' | 'refreshToken'>; tokens: AuthTokens }> {
    // Ищем пользователя по email.
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }

    // Сравниваем введенный пароль с хэшированным паролем из БД.
    const isPassEquals = await comparePassword(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль');
    }

    // Проверяем статус пользователя. Заблокированные пользователи не могут войти.
    if (user.status === Prisma.UserStatus.BLOCKED) {
      throw ApiError.ForbiddenError('Ваш аккаунт заблокирован');
    }

    // Генерируем и сохраняем токены для вошедшего пользователя.
    const tokens = this.generateAndSaveTokens(user);

    // Удаляем чувствительные данные из объекта пользователя перед отправкой клиенту.
    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;
    return { user: userWithoutSensitiveData, tokens };
  }

  /**
   * Обновляет Access Token с использованием Refresh Token.
   * @param refreshToken Refresh Token пользователя.
   * @returns Объект с новым Access Token.
   * @throws ApiError.UnauthorizedError если Refresh Token недействителен или не найден.
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    // Проверяем наличие Refresh Token.
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    // Валидируем Refresh Token.
    const userData = validateRefreshToken(refreshToken);
    // Ищем пользователя в БД по Refresh Token.
    const userFromDb = await prisma.user.findUnique({ where: { refreshToken } });

    // Если токен недействителен, не найден в БД или не соответствует пользователю.
    if (!userData || !userFromDb || userData.userId !== userFromDb.id) {
      throw ApiError.UnauthorizedError();
    }

    // Генерируем новый Access Token.
    const newAccessToken = generateAccessToken({ userId: userFromDb.id, email: userFromDb.email, role: userFromDb.role });
    return { accessToken: newAccessToken };
  }

  /**
   * Удаляет Refresh Token пользователя из базы данных, тем самым завершая сессию.
   * @param refreshToken Refresh Token пользователя для удаления.
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.user.update({
      where: { refreshToken },
      data: { refreshToken: null }, // Устанавливаем Refresh Token в null.
    });
  }

  /**
   * Вспомогательный метод для генерации и сохранения Access и Refresh токенов.
   * @param user Объект пользователя.
   * @returns Сгенерированные токены.
   */
  private generateAndSaveTokens(user: Prisma.User): AuthTokens {
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    // Сохраняем новый Refresh Token в БД для пользователя.
    prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    }).catch((e: any) => console.error("Failed to save refresh token:", e)); // Обработка ошибки сохранения токена.

    return { accessToken, refreshToken: newRefreshToken };
  }
}

export default new AuthService();