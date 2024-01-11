import { getChallenge, upsertChallenge } from '../services/db.js'
import { MessageCallback, bot } from '../services/telegramBot.js'
import { logError, logInfo } from '../services/logger.js'

export const removeLastHistoryCommand: MessageCallback = async (msg, match) => {
    const chatId = msg.chat.id
    const text = match?.[1]?.trim()

    const progressMsg = await bot.sendMessage(chatId, `🤖 Working on it`)
    const updateProgressMsg = (msg: string) => {
        bot.deleteMessage(chatId, progressMsg.message_id)
        bot.sendMessage(chatId, msg, {
            parse_mode: 'MarkdownV2',
        })
    }

    try {
        const challenge = await getChallenge(chatId)
        if (!challenge) {
            updateProgressMsg(
                "There's no leaderboard yet. You can create one with the /start command"
            )
            return
        }

        challenge.history.pop()
        await upsertChallenge(challenge)

        updateProgressMsg('Last entry was removed')

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
