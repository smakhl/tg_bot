import { SquadType, getPlayerStats } from '../services/fortniteApi.js'
import { StatsSnapshot, getChallenge, upsertChallenge } from '../services/db.js'
import { MessageCallback, bot } from '../services/telegramBot.js'
import { assignPlaces } from '../utils/assignPlaces.js'
import { logError, logInfo } from '../services/logger.js'
import { formatDistanceToNow } from 'date-fns'
import { Score, getScores } from '../features/leaderboard/getScores.js'
import { getLeaderboardNarrative } from '../features/leaderboard/getLeaderboardNarrative.js'

let rateLimiterTimestamp = 0

export const leaderboardCommand: MessageCallback = async (msg, match) => {
    const chatId = msg.chat.id
    const text = match?.[1]?.trim()
    let squadType: SquadType = SquadType.squad
    if (text) {
        if (SquadType[text as SquadType]) {
            squadType = text as SquadType
        } else {
            bot.sendMessage(
                chatId,
                'Valid squad types are: ' + Object.keys(SquadType).join(', ')
            )
            return
        }
    }

    const progressMsg = await bot.sendMessage(chatId, `🤖 Working on it`)
    const updateProgressMsg = (msg: string) => {
        bot.editMessageText(msg, {
            chat_id: chatId,
            message_id: progressMsg.message_id,
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

        const prevPrevStats: StatsSnapshot | undefined =
            challenge.history.at(-2)
        const prevStats: StatsSnapshot = challenge.history.at(-1)!
        const freshStats: StatsSnapshot = {
            created_at: new Date().toISOString(),
            players_stats: await Promise.all(
                challenge.players.map(async (player) => {
                    return {
                        account_id: player.account_id,
                        stat: (await getPlayerStats(player.account_id)).data,
                    }
                })
            ),
        }

        const { scores, lastmodified } = getScores({
            prevStats,
            freshStats,
            squadType,
            players: challenge.players,
        })

        if (scores.every((player) => player.matchesplayed === 0)) {
            updateProgressMsg(
                'There are no changes in squad stats since I last checked'
            )
            return
        }

        let prevScores: Score[] | undefined
        if (prevPrevStats) {
            prevScores = getScores({
                prevStats: prevPrevStats,
                freshStats: prevStats,
                squadType,
                players: challenge.players,
            }).scores
        }

        const placedScores = assignPlaces(
            scores.filter((player) => player.matchesplayed > 0),
            (item) => item.kills
        )

        let leaderboardForMessage = placedScores
            .map(({ place, player }) => {
                let r = `${place}. ${player.username}: ${player.kills}🔫 / ${player.matchesplayed}🎮`
                if (prevScores) {
                    let prevScore = prevScores.find(
                        (ps) => ps.username === player.username
                    )
                    if (
                        prevScore &&
                        player.matchesplayed > prevScore.matchesplayed
                    ) {
                        if (Math.abs(player.kills - prevScore.kills) > 0) {
                            r += ` / ${Math.abs(
                                player.kills - prevScore.kills
                            )}${
                                player.kills - prevScore.kills > 0 ? '↗️' : '↘️'
                            }`
                        } else {
                            r += ' / ➡️'
                        }
                    }
                }

                return r
            })
            .join('\n')

        let leaderboardMessage = [
            '📊 Kills:\n' + leaderboardForMessage,
            lastmodified
                ? 'Last modified: ' +
                  formatDistanceToNow(lastmodified * 1000, { addSuffix: true })
                : '',
        ].join('\n\n')

        await upsertChallenge({
            ...challenge,
            history: [...challenge.history, freshStats],
        })

        updateProgressMsg(leaderboardMessage)

        if (prevScores && Date.now() > rateLimiterTimestamp + 1000) {
            const prevPlacedScores = assignPlaces(
                prevScores,
                (item) => item.kills
            )
            let leaderboardForPrompt = placedScores
                .map(({ place, player }) => {
                    let r = `${place} place. ${player.username} - ${player.kills} kills`
                    if (prevScores) {
                        let prevScore = prevPlacedScores.find(
                            (ps) => ps.player.username === player.username
                        )
                        if (
                            prevScore &&
                            player.matchesplayed >
                                prevScore.player.matchesplayed
                        ) {
                            r += ` (for comparison, in the game before that, they had ${prevScore.place} place, ${prevScore.player.kills} kills)`
                        } else {
                            r += ` (skipped last game)`
                        }
                    }

                    return r
                })
                .join('\n')

            rateLimiterTimestamp = Date.now()

            const narrative = await getLeaderboardNarrative(
                leaderboardForPrompt
            )

            await bot.sendMessage(chatId, narrative)
        }

        logInfo({
            command: 'leaderboard',
            chatId,
            text,
        })
    } catch (error) {
        logError({
            command: 'leaderboard',
            chatId,
            error,
            text,
        })
        updateProgressMsg('🤖 Failed to get leaderboard')
    }
}
