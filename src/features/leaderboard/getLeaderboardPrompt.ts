import { WithPlace } from '../../utils/assignPlaces.js'
import { Score } from './getScores.js'

export function getLeaderboardPrompt(
    scores: WithPlace<Score>[],
    prevScores?: WithPlace<Score>[]
) {
    return scores
        .map(({ place, player }) => {
            let r = `${place} place. ${player.username} - ${player.kills} kills`
            if (prevScores) {
                let prevScore = prevScores.find(
                    (ps) => ps.player.username === player.username
                )
                if (prevScore && prevScore.player.matchesplayed > 0) {
                    r += ` (for comparison, in the game before that, they had ${prevScore.place} place, ${prevScore.player.kills} kills)`
                } else {
                    r += ` (skipped last game)`
                }
            }

            return r
        })
        .join('\n')
}
