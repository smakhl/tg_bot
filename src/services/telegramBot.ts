import { Telegraf } from 'telegraf'
import { logError, logInfo } from './logger.js'
import { isReplyToSetInstruction } from '../botCommands/setInstruction.js'
import { isReplyToRegister } from '../botCommands/register.js'

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
            error,
            ...(text ? { text } : {}),
        })
    })
}

export function registerLogger() {
    bot.use(async (ctx, next) => {
        await next()

        const chatId = ctx.chat?.id

        if (ctx.message && 'text' in ctx.message) {
            logInfo({
                chatId,
                message: ctx.message.text,
                ...(isReplyToSetInstruction(ctx.message)
                    ? { reply_to_setinstruction: true }
                    : {}),
                ...(isReplyToRegister(ctx.message)
                    ? { reply_to_register: true }
                    : {}),
            })
        }

        if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
            logInfo({ chatId, callback: ctx.callbackQuery.data })
        }
    })
}
