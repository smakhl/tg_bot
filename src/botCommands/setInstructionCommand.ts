import { getChallenge, upsertChallenge } from '../services/db.js'
import { MessageCallback, bot } from '../services/telegramBot.js'
import { logError, logInfo } from '../services/logger.js'

export const setInstructionCommand: MessageCallback = async (msg, match) => {
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

        challenge.instruction_for_narrative = text

        await upsertChallenge(challenge)
        await updateProgressMsg(`OK, I'll remember that`)

        logInfo({
            command: 'removeLastCommand',
            chatId,
            text,
        })
    } catch (error) {
        logError({
            command: 'removeLastCommand',
            chatId,
            error,
            text,
        })
        updateProgressMsg('🤖 Failed to get leaderboard')
    }
}
