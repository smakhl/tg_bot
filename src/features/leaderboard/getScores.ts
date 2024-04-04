import { StatsSnapshot, Player } from '../../services/db.js'
import { SquadType } from '../../services/fortniteApi/schema.js'

export type Score = {
    username: string
    kills: number
    matchesplayed: number
}

export function getScores({
    prevStats,
    freshStats,
    players,
    squadType,
}: {
    prevStats: StatsSnapshot
    freshStats: StatsSnapshot
    players: Player[]
    squadType: SquadType
}): { scores: Score[]; lastmodified: number } {
    let lastmodified = 0

    const scores = players.map((player) => {
        const prevStat = prevStats.players_stats.find(
            (ps) => ps.account_id === player.account_id
        )?.stat.global_stats[squadType]
        const freshStat = freshStats.players_stats.find(
            (ps) => ps.account_id === player.account_id
        )?.stat.global_stats[squadType]

        if (!prevStat || !freshStat)
            throw new Error('Failed to get fresh player stats')

        const kills = freshStat.kills - prevStat.kills
        const matchesplayed = freshStat.matchesplayed - prevStat.matchesplayed
        const score = {
            username: player.username,
            kills,
            matchesplayed,
        }

        if (freshStat.lastmodified > lastmodified) {
            lastmodified = freshStat.lastmodified
        }

        return score
    })

    return { scores, lastmodified }
}
