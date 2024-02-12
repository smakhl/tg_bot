import { SquadType } from '../../services/fortniteApi.js'
import { assignPlaces } from '../../utils/assignPlaces.js'
import { getScores } from './getScores.js'
import { getUpdatedChallenge } from './getUpdatedChallenge.js'

const squadType: SquadType = SquadType.squad

export async function getLeaderboard(chatId: number) {
    const updatedChallenge = await getUpdatedChallenge(chatId)
    if (!updatedChallenge) return

    const prevPrevStats = updatedChallenge.history.at(-3)
    const prevStats = updatedChallenge.history.at(-2)!
    const freshStats = updatedChallenge.history.at(-1)!

    const { scores, lastmodified } = getScores({
        prevStats,
        freshStats,
        squadType,
        players: updatedChallenge.players,
    })
    const placedScores = assignPlaces(scores, (item) => item.kills)

    let placedPrevScores
    if (prevPrevStats) {
        const prevScores = getScores({
            prevStats: prevPrevStats,
            freshStats: prevStats,
            squadType,
            players: updatedChallenge.players,
        }).scores
        placedPrevScores = assignPlaces(prevScores, (item) => item.kills)
    }

    return {
        updatedChallenge,
        scores: placedScores,
        prevScores: placedPrevScores,
        lastmodified,
    }
}
