import { getScores } from './features/leaderboard/getScores.js'
import { StatsSnapshot, getChallenge } from './services/db.js'
import { SquadType } from './services/fortniteApi.js'

const challenge = await getChallenge(Number(process.env.TEST_CHAT_ID))
if (!challenge) process.exit()

const prevPrevStats: StatsSnapshot = challenge.history.at(-3)!
const prevStats: StatsSnapshot = challenge.history.at(-2)!
const freshStats: StatsSnapshot = challenge.history.at(-1)!

const scores = getScores({
    prevStats,
    freshStats,
    squadType: SquadType.squad,
    players: challenge.players,
}).scores
console.log('🚀 ~ run ~ scores:', scores)

let prevScores = getScores({
    prevStats: prevPrevStats,
    freshStats: prevStats,
    squadType: SquadType.squad,
    players: challenge.players,
}).scores
console.log('🚀 ~ run ~ prevScores:', prevScores)
