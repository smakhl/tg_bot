import { registerLeaderboardCommands } from './botCommands/leaderboard.js'
import { registerRegisterCommand } from './botCommands/register.js'
import { registerRemoveLastCommand } from './botCommands/removeLast.js'
import { registerSetInstructionCommands } from './botCommands/setInstruction.js'
import { client as dbClient } from './services/db.js'
import { logInfo } from './services/logger.js'
import {
    bot,
    registerErrorHandler,
    registerLogger,
} from './services/telegramBot.js'

// bot.use(Telegraf.log())

await dbClient.connect()

bot.telegram.setMyCommands(
    [
        { command: 'leaderboard', description: 'leaderboard' },
        { command: 'removelast', description: 'removelast' },
        { command: 'setinstruction', description: 'setinstruction' },
        { command: 'register', description: 'register' },
    ],
    { scope: { type: 'default' }, language_code: 'en' }
)

registerErrorHandler()
registerLogger()

registerRegisterCommand()
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
