import { Markup } from 'telegraf'
import { message } from 'telegraf/filters'
import { Message } from 'telegraf/types'
import { Player, StatsSnapshot, upsertChallenge } from '../services/db.js'
import { getPlayerStats, searchAccountId } from '../services/fortniteApi.js'
import { bot } from '../services/telegramBot.js'
import { getRepliedMessageText } from '../utils/getRepliedMessageText.js'
import { parseUser } from '../utils/parseUser.js'

const question = `Reply to this message with the list of Fortnite usernames`
export const isReplyToRegister = (message: Message.CommonMessage) => {
    return getRepliedMessageText(message) === question
}

export const registerRegisterCommand = () => {
    bot.command('register', async (ctx) => {
        ctx.replyWithMarkdownV2(question, {
            ...Markup.forceReply()
                .selective()
                .placeholder('username1 username2 username3'),
            reply_to_message_id: ctx.message.message_id,
        })
    })

    bot.on(message('text', 'reply_to_message'), async (ctx, next) => {
        const message = ctx.message
        const chatId = ctx.chat.id

        if (!isReplyToRegister(message)) return next()

        const progressMsg = await ctx.reply(
            `🤖 Working on it`,
            Markup.removeKeyboard()
        )

        const usernames = message.text
            ?.split(' ')
            .map((name) => name.trim())
            .filter(Boolean)

        const accounts = await Promise.all(
            usernames.map(async (user) => {
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
                ctx.reply(`${username}:${platform} is not found`)
            }
        })
        if (!success) {
            await ctx.deleteMessage(progressMsg.message_id)
            await ctx.reply('🤖 Could not verify all players')
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
            chat_id: chatId,
            players,
            history,
        })

        await ctx.deleteMessage(progressMsg.message_id)
        await ctx.reply(
            "🤖 Leaderboard has been created successfully! Use the /leaderboard command after you've played some games"
        )
    })
}
