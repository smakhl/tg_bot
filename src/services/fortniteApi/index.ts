import axios from 'axios'
import { AccountResponse, AccountStatsResponse } from './schema.js'

if (!process.env.FORTNITE_API_TOKEN) {
    throw new Error('Missing FORTNITE_API_TOKEN')
}

// axios.defaults.headers.common['Accept-Encoding'] = 'gzip'

const FortniteApiInstance = axios.create({
    baseURL: 'https://fortniteapi.io',
    headers: { Authorization: process.env.FORTNITE_API_TOKEN },
})

export async function searchAccountId(
    username: string,
    platform?: string
): Promise<AccountResponse> {
    const response = await FortniteApiInstance.get<AccountResponse>(
        '/v1/lookup',
        {
            params: { username, platform },
        }
    )

    return AccountResponse.parse(response.data)
}

export async function getPlayerStats(
    accountId: string
): Promise<AccountStatsResponse> {
    const response = await FortniteApiInstance.get<AccountStatsResponse>(
        '/v1/stats',
        {
            params: { account: accountId },
        }
    )

    return AccountStatsResponse.parse(response.data)
}
