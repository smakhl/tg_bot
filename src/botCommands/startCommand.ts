import { getPlayerStats, searchAccountId } from '../services/fortniteApi.js'
import { Player, StatsSnapshot, upsertChallenge } from '../services/db.js'
import { bot, MessageCallback } from '../services/telegramBot.js'
import { parseUser } from '../utils/parseUser.js'
import { logError, logInfo } from '../services/logger.js'

export const startCommand: MessageCallback = async (msg, match) => {
    const chatId = msg.chat.id
    const text = match?.[1]
    const users = text
        ?.split(' ')
        .map((name) => name.trim())
        .filter(Boolean)
    if (!users?.length) {
        bot.sendMessage(
            chatId,
            `You can start the challenge by sending the command "/start username1 username2 ..."`
        )
        return
    }

    const progressMsg = await bot.sendMessage(chatId, `🤖 Working on it`)
    const updateProgressMsg = (msg: string) => {
        bot.editMessageText(msg, {
            chat_id: chatId,
            message_id: progressMsg.message_id,
        })
    }

    try {
        const accounts = await Promise.all(
            users.map(async (user) => {
                const { username, platform } = parseUser(user)
                return {
                    data: (await searchAccountId(username, platform)).data,
                    username,
                    platform,
                }
            })
        )

        let success = true
        accounts.forEach((account) => {
            if (!account.data.result) {
                success = false
                const { username, platform } = account
                bot.sendMessage(chatId, `${username}:${platform} is not found`)
            }
        })
        if (!success) {
            updateProgressMsg('🤖 Could not verify all players')
            return
        }

        const stats = await Promise.all(
            accounts.map(async (account) => {
                const account_id = account.data.account_id!
                const { username, platform } = account
                return {
                    account_id,
                    username,
                    platform,
                    data: (await getPlayerStats(account_id)).data,
                }
            })
        )

        const players: Player[] = stats.map((stat) => {
            return {
                account_id: stat.account_id,
                username: stat.username,
                platform: stat.platform,
            }
        })

        const history: StatsSnapshot[] = [
            {
                created_at: new Date().toISOString(),
                players_stats: stats.map((d) => ({
                    account_id: d.account_id,
                    stat: d.data,
                })),
            },
        ]

        await upsertChallenge({
            chat_id: msg.chat.id,
            players,
            history,
        })

        updateProgressMsg(
            "🤖 Leaderboard has been created successfully! Use the /leaderboard command after you've played some games"
        )
        logInfo({
            command: 'start',
            chatId,
            text,
        })
    } catch (error) {
        updateProgressMsg('🤖 Failed to create leaderboard')
        logError({
            command: 'start',
            chatId,
            error,
            text,
        })
    }
}
