import { Logging } from '@google-cloud/logging'

if (!process.env.APP_NAME) {
    throw new Error('Missing APP_NAME')
}

const logging = new Logging({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})
const log = logging.log(process.env.APP_NAME)

export function logInfo(entry: any) {
    console.log(entry)
    log.info(log.entry(entry))
}

export function logError(entry: any) {
    console.error(entry)
    log.error(log.entry(entry))
}
