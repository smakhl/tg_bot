import { SquadType, getPlayerStats } from '../services/fortniteApi.js'
import { getChallenge } from '../services/db.js'
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
        const freshStats = await Promise.all(
            challenge.participants.map(async (participant) => {
                return (await getPlayerStats(participant.account_id)).data
            })
        )
        let lastmodified = 0
        const scores = challenge.participants.map((participant, i) => {
            const initialStat = participant.stats.global_stats[squadType]
            const freshStat = freshStats[i]?.global_stats[squadType]
            if (!freshStat) throw new Error('Failed to get fresh player stats')
            const initialDeaths =
                initialStat.matchesplayed - initialStat.placetop1
            const freshDeaths = freshStat.matchesplayed - freshStat.placetop1
            const kills = freshStat.kills - initialStat.kills
            const deaths = freshDeaths - initialDeaths
            const score = {
                username: participant.username,
                kills,
                deaths,
                kd: (kills || 1) / (deaths || 1),
            }
            if (freshStat.lastmodified > lastmodified) {
                lastmodified = freshStat.lastmodified
            }
            return score
        })
        const byKd = [...scores].sort((a, b) => b.kd - a.kd)
        const byKills = [...scores].sort((a, b) => b.kills - a.kills)

        const kdLeaders = assignPlaces(byKd, (item) => item.kd)
        const killsLeaders = assignPlaces(byKills, (item) => item.kills)

        if (
            scores.every((player) => player.kills === 0) &&
            scores.every((player) => player.deaths === 0)
        ) {
            bot.sendMessage(
                chatId,
                'There are no changes in squad stats since I last checked'
            )
            return
        }

        let killsLeaderboard = killsLeaders
            .map(
                (player) =>
                    `${player.place}. ${player.item.username} - ${player.item.kills}`
            )
            .join('\n')
        let kdLeaderboard = kdLeaders
            .map(
                (player) =>
                    `${player.place}. ${player.item.username} - ${round(
                        player.item.kd
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
