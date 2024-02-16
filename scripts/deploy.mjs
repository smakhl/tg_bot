import { $ } from 'zx'

const { APP_NAME, SERVER_NAME, APP_DIR } = process.env

if (!APP_NAME || !SERVER_NAME || !APP_DIR) {
    throw new Error('Missing env configs')
}

const ssh = async (cmd) =>
    $`gcloud compute ssh ${SERVER_NAME} --command=${cmd.trim()}`

await $`node ~/code/scripts/src/firewall.mjs update`

await ssh(`
cd ${APP_DIR} && \
(docker stop ${APP_NAME} || true) && \
git pull --rebase && \
docker build -t ${APP_NAME} . && \
docker run --rm --detach \
    --name=${APP_NAME} \
    --env-file=.env \
    -v="${APP_DIR}/service_account.json:/app/service_account.json" \
    ${APP_NAME}
`)
