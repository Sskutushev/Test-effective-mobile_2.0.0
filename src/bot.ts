import { Telegraf, Markup } from 'telegraf';
import { BOT_TOKEN } from './config/env';

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf(BOT_TOKEN);

const webAppUrl = 'https://Sskutushev.github.io/Test-effective-mobile_2.0/';

bot.start((ctx) => {
  ctx.reply(
    'Welcome! Click the button below to open the app.',
    Markup.inlineKeyboard([
      Markup.button.webApp('Open App', webAppUrl),
    ])
  );
});

export const startBot = () => {
  bot.launch(() => {
    console.log('Telegram bot started');
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
