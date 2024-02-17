import { Markup } from 'telegraf'
import { message } from 'telegraf/filters'
import { Message } from 'telegraf/types'
import { getChallenge, upsertChallenge } from '../services/db.js'
import { bot } from '../services/telegramBot.js'
import { getRepliedMessageText } from '../utils/getRepliedMessageText.js'

const question = `What are the instructions? (reply to this message)`
export const isReplyToSetInstruction = (message: Message.CommonMessage) => {
    return getRepliedMessageText(message) === question
}

export const registerSetInstructionCommands = () => {
    bot.command('setinstruction', async (ctx) => {
        ctx.reply(question, {
            ...Markup.forceReply().selective(),
            reply_to_message_id: ctx.message.message_id,
        })
    })

    bot.on(message('text', 'reply_to_message'), async (ctx, next) => {
        const message = ctx.message
        const chatId = ctx.chat.id

        if (!isReplyToSetInstruction(message)) return next()

        const progressMsg = await ctx.reply(
            `🤖 Working on it`,
            Markup.removeKeyboard()
        )

        const newInstruction = message.text

        const challenge = await getChallenge(chatId)
        if (!challenge) {
            await ctx.deleteMessage(progressMsg.message_id)
            await ctx.reply(
                "There's no leaderboard yet. You can create one with the /register command"
            )
            return
        }

        challenge.instruction_for_narrative = newInstruction

        await upsertChallenge(challenge)

        await ctx.deleteMessage(progressMsg.message_id)
        await ctx.reply(`OK, I'll remember that`)
    })
}
