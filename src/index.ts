import { logInfo } from './services/logger.js'
import { registerLeaderboardCommands } from './botCommands/leaderboard.js'
import { bot, registerErrorHandler } from './services/telegramBot.js'
import { client as dbClient } from './services/db.js'
import { registerRemoveLastCommand } from './botCommands/removeLast.js'
import { registerSetInstructionCommands } from './botCommands/setInstruction.js'
import { Telegraf } from 'telegraf'

// bot.use(Telegraf.log())

await dbClient.connect()

bot.telegram.setMyCommands(
    [
        { command: 'leaderboard', description: 'leaderboard' },
        { command: 'removelast', description: 'removelast' },
        { command: 'setinstruction', description: 'setinstruction' },
    ],
    { scope: { type: 'default' }, language_code: 'en' }
)

registerErrorHandler()

registerLeaderboardCommands()
registerRemoveLastCommand()
registerSetInstructionCommands()

bot.launch()

logInfo({ message: 'Bot started' })

process.once('SIGINT', async () => {
    bot.stop('SIGINT')
    logInfo({ message: 'Bot stopped SIGINT' })
    await dbClient.close()
    process.exit(0)
})

process.once('SIGTERM', async () => {
    bot.stop('SIGTERM')
    logInfo({ message: 'Bot stopped SIGTERM' })
    await dbClient.close()
    process.exit(0)
})
