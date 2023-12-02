import TelegramBot from 'node-telegram-bot-api'

if (!process.env.BOT_TOKEN) {
    throw new Error('Missing BOT_TOKEN')
}

export const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

type BotInstance = InstanceType<typeof TelegramBot>

export type MessageCallback = Parameters<BotInstance['onText']>[1]
