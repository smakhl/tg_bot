import { logInfo } from '../services/logger.js'
import { MessageCallback, bot } from '../services/telegramBot.js'

export const helpCommand: MessageCallback = (msg, match) => {
    const chatId = msg.chat.id
    const text = match?.[1]?.trim()
    bot.sendMessage(
        chatId,
        `
This bot can create a custom Fortnite leaderboard in your Telegram chat

How to use it:
1. Register it in your chat by using command "/start player1 player2 ...". 
Replace "player1 player2 ..." with actual Fortnite usernames of players. You can specify player platforms -- "/start player1:xbl player2:psn ...". Supported platforms are "epic", "psn", "xbl". When you don't specify the platform, "epic" is used as default.
You can check individual username with "/check username:platform" command.

2. After you've played some games, use the "/leaderboard" command. The bot will respond with the leaderboard based on the Fortnite stats of the registered players.
You can specify the squad type -- "/leaderboard duo". Supported squad types are "squad", "trio", "duo", "solo". Default is "squad".

You can reset the stats for all players by using the "/start player1 player2 ..." command again.
`
    )
    logInfo({
        command: 'help',
        chatId,
        text,
    })
}
