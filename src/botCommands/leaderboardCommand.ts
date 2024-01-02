import { SquadType, getPlayerStats } from '../services/fortniteApi.js'
import { StatsSnapshot, getChallenge, upsertChallenge } from '../services/db.js'
import { MessageCallback, bot } from '../services/telegramBot.js'
import { round } from '../utils/round.js'
import { assignPlaces } from '../utils/assignPlaces.js'
import { logError, logInfo } from '../services/logger.js'
import { formatDistanceToNow } from 'date-fns'

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

        let lastmodified = 0
        const scores = challenge.players.map((player, i) => {
            const prevStat = prevStats.players_stats.find(
                (ps) => ps.account_id === player.account_id
            )?.stat.global_stats[squadType]
            const freshStat = freshStats.players_stats.find(
                (ps) => ps.account_id === player.account_id
            )?.stat.global_stats[squadType]

            if (!prevStat || !freshStat)
                throw new Error('Failed to get fresh player stats')

            const prevDeaths = prevStat.matchesplayed - prevStat.placetop1
            const freshDeaths = freshStat.matchesplayed - freshStat.placetop1
            const kills = freshStat.kills - prevStat.kills
            const deaths = freshDeaths - prevDeaths
            const score = {
                username: player.username,
                kills,
                deaths,
                kd: (kills || 1) / (deaths || 1),
            }

            if (freshStat.lastmodified > lastmodified) {
                lastmodified = freshStat.lastmodified
            }

            return score
        })

        if (
            scores.every((player) => player.kills === 0) &&
            scores.every((player) => player.deaths === 0)
        ) {
            updateProgressMsg(
                'There are no changes in squad stats since I last checked'
            )
            return
        }

        const killsLeaders = assignPlaces(scores, (item) => item.kills)
        const kdLeaders = assignPlaces(scores, (item) => item.kd)

        let killsLeaderboard = killsLeaders
            .filter((player) => player.player.kills > 0)
            .map(
                (player) =>
                    `${player.place}. ${player.player.username} - ${player.player.kills}`
            )
            .join('\n')

        let kdLeaderboard = kdLeaders
            .filter((player) => player.player.kills > 0)
            .map(
                (player) =>
                    `${player.place}. ${player.player.username} - ${round(
                        player.player.kd
                    )}`
            )
            .join('\n')

        let leaderboardMessage = [
            '📊 By kill count:\n' + killsLeaderboard,
            '📊 By kill/death ratio:\n' + kdLeaderboard,
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
