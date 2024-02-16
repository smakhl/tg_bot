import { getLeaderboard } from './features/leaderboard/getLeaderboard.js'
import { getLeaderboardNarrative } from './features/leaderboard/getLeaderboardNarrative.js'
import { getLeaderboardPrompt } from './features/leaderboard/getLeaderboardPrompt.js'

const leaderboard = await getLeaderboard(Number(process.env.TEST_CHAT_ID))
if (!leaderboard) process.exit()

let leaderboardPrompt = getLeaderboardPrompt(
    leaderboard.scores,
    leaderboard.prevScores
)

const narrative = await getLeaderboardNarrative(
    leaderboardPrompt,
    leaderboard.updatedChallenge.instruction_for_narrative
)

console.log(narrative)
