import axios from 'axios'

if (!process.env.FORTNITE_API_TOKEN) {
    throw new Error('Missing FORTNITE_API_TOKEN')
}

// axios.defaults.headers.common['Accept-Encoding'] = 'gzip'

const FortniteApiInstance = axios.create({
    baseURL: 'https://fortniteapi.io',
    headers: { Authorization: process.env.FORTNITE_API_TOKEN },
})

export const AccountPlatform = {
    epic: 'epic',
    xbl: 'xbl',
    psn: 'psn',
    steam: 'steam',
} as const

export type AccountPlatform =
    (typeof AccountPlatform)[keyof typeof AccountPlatform]

export async function searchAccountId(username: string, platform?: string) {
    return FortniteApiInstance.get<AccountResponse>('/v1/lookup', {
        params: { username, platform },
    })
}

export async function getPlayerStats(accountId: string) {
    return FortniteApiInstance.get<AccountStatsResponse>('/v1/stats', {
        params: { account: accountId },
    })
}

export type AccountResponse = {
    result: boolean
    account_id?: string
    error?: { code: string }
}

export type AccountStatsResponse = {
    result: boolean
    name: string
    account: AccountLevel
    accountLevelHistory: AccountLevel[]
    global_stats: StatsByTeamType
    per_input: {
        gamepad: StatsByTeamType
        keyboardmouse: StatsByTeamType
    }
    seasons_available: number[]
}

export type AccountLevel = {
    season: number
    level: number
    process_pct: number
}

export const SquadType = {
    solo: 'solo',
    duo: 'duo',
    trio: 'trio',
    squad: 'squad',
} as const

export type SquadType = (typeof SquadType)[keyof typeof SquadType]

export type StatsByTeamType = {
    trio: PlayerStats
    duo: PlayerStats
    solo: PlayerStats
    squad: PlayerStats
}

export type PlayerStats = {
    placetop1: number
    kd: number
    winrate: number
    placetop3: number
    placetop5: number
    placetop6: number
    placetop10: number
    placetop12: number
    placetop25: number
    kills: number
    matchesplayed: number
    minutesplayed: number
    score: number
    playersoutlived: number
    lastmodified: number
}
