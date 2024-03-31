import { $ } from 'zx'

const { SERVER_NAME } = process.env

if (!SERVER_NAME) {
    throw new Error('Missing env configs')
}

const myIp = await $`curl -s https://ipinfo.io/ip`
await $`gcloud compute firewall-rules update my-rule --source-ranges=${myIp}/32`

await $`gcloud compute ssh makhlonov@${SERVER_NAME}`
