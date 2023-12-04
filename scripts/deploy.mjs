import { $ } from 'zx'

const appName = 'tg_bot'
const instanceName = process.env.SERVER_NAME
const remoteAppFolder = `/home/makhlonov/apps/${appName}`

const ssh = async (cmd) =>
    $`gcloud compute ssh ${instanceName} --command=${cmd.trim()}`

await $`node ~/code/scripts/src/firewall.mjs update`

await ssh(`
cd ${remoteAppFolder} && \
(docker stop ${appName} || true) && \
git pull && \
docker build -t ${appName} . && \
docker run --rm --detach \
    --name=${appName} \
    --env-file=.env \
    -v="${remoteAppFolder}/service_account.json:/app/service_account.json" \
    ${appName}
`)
