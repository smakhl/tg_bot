import { $ } from 'zx'

const { APP_NAME, SERVER_NAME, APP_DIR } = process.env

if (!APP_NAME || !SERVER_NAME || !APP_DIR) {
    throw new Error('Missing env configs')
}

const ssh = async (cmd) =>
    $`gcloud compute ssh ${SERVER_NAME} --command=${cmd.trim()}`

await $`node ~/code/scripts/src/firewall.mjs update`

await ssh(`
(docker stop ${APP_NAME} || true)
`)
