import { Message } from 'telegraf/types'

export const getRepliedMessageText = (message: Message.CommonMessage) => {
    if (
        'reply_to_message' in message &&
        message.reply_to_message &&
        'text' in message.reply_to_message &&
        message.reply_to_message.text
    )
        return message.reply_to_message.text
}
