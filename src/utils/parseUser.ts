import { AccountPlatform } from '../services/fortniteApi.js'

export function parseUser(text: string) {
    let platform: AccountPlatform = AccountPlatform.epic
    let username = text
    if (text.includes(':')) {
        username = text.split(':')[0]!
        platform = text.split(':')[1]!.toLocaleLowerCase() as AccountPlatform
    }
    return {
        platform,
        username,
    }
}
