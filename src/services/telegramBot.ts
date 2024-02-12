import { Telegraf } from 'telegraf'
import { logError } from './logger.js'

if (!process.env.BOT_TOKEN) throw new Error('Missing BOT_TOKEN')

export const bot = new Telegraf(process.env.BOT_TOKEN)

export function registerErrorHandler() {
    bot.catch((error, ctx) => {
        ctx.reply(`🤖 Something went wrong`)

        let text
        if (ctx.message && 'text' in ctx.message) {
            text = ctx.message.text
        }
        logError({
            chatId: ctx.chat?.id,
            text,
            error,
        })
    })
}
