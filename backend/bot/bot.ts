import TelegramBot from 'node-telegram-bot-api'
import { load } from "https://deno.land/std@0.200.0/dotenv/mod.ts";

const env = await load({
    envPath: `../../.env`,
    export: true
})

const token = Deno.env.get("TOKEN")
const bot  = new TelegramBot(token, {polling: true})

bot.onText(/\/start/, (msg) => {
    const chatID = msg.chat.id;

    const keybord = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Гойда',
                    web_app: {url: "https://san-andro.github.io/tgapp/"}
                }]
            ]
        }
    };

    bot.sendMessage(chatID, "Нажмите скорее старт чтобы запустить приложение!", keybord);
})


