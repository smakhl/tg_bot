import { bot } from './services/telegramBot.js'
import { startCommand } from './botCommands/startCommand.js'
import { leaderboardCommand } from './botCommands/leaderboardCommand.js'
import { checkCommand } from './botCommands/checkCommand.js'
import { logInfo } from './services/logger.js'
import { helpCommand } from './botCommands/helpCommand.js'
import { removeLastCommand } from './botCommands/removeLastCommand.js'

bot.setMyCommands([
    {
        command: 'start',
        description: 'register new leaderboard. See help for example',
    },
    { command: 'leaderboard', description: 'get leaderboard' },
    { command: 'removeLast', description: 'remove last leaderboard' },
    { command: 'check', description: 'check username' },
    { command: 'help', description: 'see help' },
])

bot.onText(/\/start(\s.+)?/, startCommand)

bot.onText(/\/leaderboard(\s.+)?/, leaderboardCommand)

bot.onText(/\/removeLast(\s.+)?/, removeLastCommand)

bot.onText(/\/check(\s.+)?/, checkCommand)

bot.onText(/\/help(\s.+)?/, helpCommand)

logInfo({ message: 'Bot started' })

process.on('SIGINT', () => {
    console.info('Interrupted')
    process.exit(0)
})
