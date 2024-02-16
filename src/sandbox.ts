import { getLeaderboard } from './features/leaderboard/getLeaderboard.js'
import { getLeaderboardNarrative } from './features/leaderboard/getLeaderboardNarrative.js'
import { getLeaderboardPrompt } from './features/leaderboard/getLeaderboardPrompt.js'
import { client as dbClient } from './services/db.js'

const leaderboard = await getLeaderboard(Number(process.env.TEST_CHAT_ID), 0)
if (!leaderboard) process.exit()

let leaderboardPrompt = getLeaderboardPrompt(
    leaderboard.scores,
    leaderboard.prevScores
)

const narrative = await getLeaderboardNarrative(
    leaderboardPrompt,
    leaderboard.updatedChallenge.instruction_for_narrative
)

await dbClient.close()

console.log(narrative)
