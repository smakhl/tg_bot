import { getChallenge, upsertChallenge } from '../services/db.js'
import { MessageCallback, bot } from '../services/telegramBot.js'
import { logError, logInfo } from '../services/logger.js'

export const removeLastHistoryCommand: MessageCallback = async (msg, match) => {
    const chatId = msg.chat.id
    const text = match?.[1]?.trim()

    const progressMsg = await bot.sendMessage(chatId, `🤖 Working on it`)
    const updateProgressMsg = async (msg: string) => {
        await bot.deleteMessage(chatId, progressMsg.message_id)
        await bot.sendMessage(chatId, msg)
    }

    try {
        const challenge = await getChallenge(chatId)
        if (!challenge) {
            await updateProgressMsg(
                "There's no leaderboard yet. You can create one with the /start command"
            )
            return
        }

        let removedItem = challenge.history.pop()
        if (removedItem) {
            await upsertChallenge(challenge)
            await updateProgressMsg(
                `The entry from ${removedItem.created_at} was removed`
            )
        } else {
            await updateProgressMsg(`Nothing to remove`)
        }

        logInfo({
            command: 'removeLastHistoryCommand',
            chatId,
            text,
        })
    } catch (error) {
        logError({
            command: 'removeLastHistoryCommand',
            chatId,
            error,
            text,
        })
        updateProgressMsg('🤖 Failed to get leaderboard')
    }
}
