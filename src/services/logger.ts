import { Logging } from '@google-cloud/logging'

const logging = new Logging({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})
const log = logging.log('tg_bot')

export function logInfo(entry: any) {
    console.log(entry)
    log.info(log.entry(entry))
}

export function logError(entry: any) {
    console.error(entry)
    log.error(log.entry(entry))
}
