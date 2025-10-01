import { PrismaClient } from '@prisma/client'; // Импортируем PrismaClient из сгенерированного пакета Prisma.

// Создаем единственный экземпляр PrismaClient.
// Это гарантирует, что у нас будет только одно подключение к базе данных на протяжении всего приложения (Singleton).
const prisma = new PrismaClient();

// Экспортируем созданный экземпляр PrismaClient для использования в других частях приложения.
export default prisma;