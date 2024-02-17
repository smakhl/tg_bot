import { getChallenge, upsertChallenge } from '../services/db.js'
import { bot } from '../services/telegramBot.js'

export const registerRemoveLastCommand = () => {
    bot.command('removelast', async (ctx) => {
        const chatId = ctx.chat.id
        const progressMsg = await ctx.reply(`🤖 Working on it`)

        const challenge = await getChallenge(chatId)
        if (!challenge) {
            await ctx.deleteMessage(progressMsg.message_id)
            await ctx.reply(
                "There's no leaderboard yet. You can create one with the /start command"
            )
            return
        }

        let removedItem = challenge.history.pop()
        if (removedItem && challenge.history.length > 0) {
            await upsertChallenge(challenge)
            await ctx.deleteMessage(progressMsg.message_id)
            await ctx.reply(
                `The entry from ${removedItem.created_at} was removed`
            )
        } else {
            await ctx.deleteMessage(progressMsg.message_id)
            await ctx.reply(`Nothing to remove`)
        }
    })
}
