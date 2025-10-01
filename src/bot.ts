/**
 * @file Логика Telegram-бота.
 * @description Инициализирует Telegram-бота, обрабатывает команду /start и предоставляет кнопку для запуска Mini App.
 */

import { Telegraf, Markup } from 'telegraf';
import { BOT_TOKEN } from './config/env';

/**
 * @section Проверка токена бота
 * @description Убеждается, что токен Telegram-бота предоставлен в переменных окружения.
 */
if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN must be provided!');
}

/**
 * @section Инициализация бота
 * @description Создание экземпляра Telegraf бота с использованием предоставленного токена.
 */
const bot = new Telegraf(BOT_TOKEN);

/**
 * @constant webAppUrl
 * @description URL веб-приложения (Telegram Mini App), которое будет открываться по кнопке.
 * Указывает на развернутый фронтенд проекта.
 */
const webAppUrl = 'https://Sskutushev.github.io/Test-effective-mobile_2.0.0/';

/**
 * @section Обработчик команды /start
 * @description Отвечает на команду /start, отправляя приветственное сообщение и кнопку для запуска Mini App.
 */
bot.start((ctx) => {
  ctx.reply(
    'Welcome! Click the button below to open the app.',
    Markup.inlineKeyboard([
      Markup.button.webApp('Open App', webAppUrl), // Кнопка, запускающая веб-приложение.
    ])
  );
});

/**
 * @function startBot
 * @description Запускает Telegram-бота и настраивает обработку сигналов для корректного завершения работы.
 */
export const startBot = () => {
  bot.launch(() => {
    console.log('Telegram bot started');
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT')); // Обработка сигнала прерывания (Ctrl+C).
  process.once('SIGTERM', () => bot.stop('SIGTERM')); // Обработка сигнала завершения.
};
