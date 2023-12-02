import { searchAccountId } from '../services/fortniteApi.js'
import { logError, logInfo } from '../services/logger.js'
import { MessageCallback, bot } from '../services/telegramBot.js'
import { parseUser } from '../utils/parseUser.js'

export const checkCommand: MessageCallback = async (msg, match) => {
    const chatId = msg.chat.id
    const text = match?.[1]?.trim()
    try {
        if (!text) {
            bot.sendMessage(
                chatId,
                'You can check the players username in Fortnite by ' +
                    'sending the command "/check username"'
            )
            return
        }

        const { username, platform } = parseUser(text)
        const result = await searchAccountId(username, platform)
        bot.sendMessage(
            chatId,
            `${username}:${platform} is ${
                result.data.result
                    ? 'OK'
                    : 'not OK. ' + JSON.stringify(result.data.error)
            }`
        )
        logInfo({
            command: 'check',
            chatId,
        })
    } catch (error) {
        logError({
            command: 'check',
            chatId,
            text,
            error,
        })
    }
}
