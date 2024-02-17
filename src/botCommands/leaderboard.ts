import { upsertChallenge } from '../services/db.js'
import { formatDistanceToNow } from 'date-fns'
import { getLeaderboardNarrative } from '../features/leaderboard/getLeaderboardNarrative.js'
import { getLeaderboardPrompt } from '../features/leaderboard/getLeaderboardPrompt.js'
import { printLeaderboardTable } from '../features/leaderboard/printLeaderboardTable.js'
import { getLeaderboard } from '../features/leaderboard/getLeaderboard.js'
import { bot } from '../services/telegramBot.js'
import { Markup } from 'telegraf'
import { Score } from '../features/leaderboard/getScores.js'
import { WithPlace } from '../utils/assignPlaces.js'

let rateLimiterTimestamp = 0

export const registerLeaderboardCommands = () => {
    bot.command('leaderboard', async (ctx) => {
        const chatId = ctx.chat.id

        const progressMsg = await ctx.reply(`🤖 Working on it`)

        const leaderboard = await getLeaderboard(chatId)
        if (!leaderboard) {
            await ctx.deleteMessage(progressMsg.message_id)
            await ctx.reply(
                "There's no leaderboard yet. You can create one with the /register command"
            )
            return
        }

        if (
            leaderboard.scores.every(({ player }) => player.matchesplayed === 0)
        ) {
            await ctx.deleteMessage(progressMsg.message_id)
            await ctx.reply(
                'There are no changes in squad stats since I last checked'
            )
            return
        }

        await ctx.deleteMessage(progressMsg.message_id)
        await ctx.reply(
            'Your last game was ' +
                formatDistanceToNow(leaderboard.lastmodified * 1000, {
                    addSuffix: true,
                }) +
                '?',
            Markup.inlineKeyboard([
                Markup.button.callback('Yes', 'leaderboardYes'),
                Markup.button.callback('No, refresh', 'leaderboardRefresh'),
            ])
        )
    })

    bot.action('leaderboardYes', async (ctx) => {
        await ctx.editMessageText('🤖 Please wait...')
        const chatId = ctx.chat?.id
        if (!chatId) return

        const leaderboard = await getLeaderboard(chatId)
        if (!leaderboard) return

        await upsertChallenge(leaderboard.updatedChallenge)

        const leaderboardForMessage = printLeaderboardTable(
            filterSkippedPlayers(leaderboard.scores)
        )
        await ctx.reply(
            '🏆 Leaderboard:\n' + '```' + leaderboardForMessage + '```',
            { parse_mode: 'MarkdownV2' }
        )
        await ctx.deleteMessage()
        await ctx.answerCbQuery()

        if (Date.now() > rateLimiterTimestamp + 1000) {
            const leaderboardPrompt = getLeaderboardPrompt(
                filterSkippedPlayers(leaderboard.scores),
                leaderboard.prevScores
                    ? filterSkippedPlayers(leaderboard.prevScores)
                    : undefined
            )

            rateLimiterTimestamp = Date.now()

            const narrative = await getLeaderboardNarrative(
                leaderboardPrompt,
                leaderboard.updatedChallenge.instruction_for_narrative
            )

            await ctx.reply(narrative)
        }
    })

    bot.action('leaderboardRefresh', async (ctx) => {
        await ctx.editMessageText('🤖 Please wait...')
        const chatId = ctx.chat?.id
        if (!chatId) return

        const leaderboard = await getLeaderboard(chatId)
        if (!leaderboard) return

        const lastmodified = leaderboard.lastmodified

        await ctx.editMessageText(
            'Your last game was ' +
                formatDistanceToNow(lastmodified * 1000, { addSuffix: true }) +
                '. Create leaderboard?',
            Markup.inlineKeyboard([
                Markup.button.callback('Yes', 'leaderboardYes'),
                Markup.button.callback('No, refresh', 'leaderboardRefresh'),
            ])
        )
        await ctx.answerCbQuery()
    })
}

const filterSkippedPlayers = (scores: WithPlace<Score>[]) =>
    scores.filter(({ player }) => player.matchesplayed > 0)
