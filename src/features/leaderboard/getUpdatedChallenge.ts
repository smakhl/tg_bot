import { getPlayerStats } from '../../services/fortniteApi/index.js'
import { Challenge, StatsSnapshot, getChallenge } from '../../services/db.js'

export async function getUpdatedChallenge(chatId: number) {
    const challenge = await getChallenge(chatId)
    if (!challenge) return

    const freshStats: StatsSnapshot = {
        created_at: new Date().toISOString(),
        players_stats: await Promise.all(
            challenge.players.map(async (player) => {
                return {
                    account_id: player.account_id,
                    stat: await getPlayerStats(player.account_id),
                }
            })
        ),
    }

    const updatedChallenge: Challenge = {
        ...challenge,
        history: [...challenge.history, freshStats],
    }

    return updatedChallenge
}
