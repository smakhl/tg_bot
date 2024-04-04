import { z } from 'zod'

export const AccountPlatform = {
    epic: 'epic',
    xbl: 'xbl',
    psn: 'psn',
    steam: 'steam',
} as const

export type AccountPlatform =
    (typeof AccountPlatform)[keyof typeof AccountPlatform]

export const SquadType = {
    solo: 'solo',
    duo: 'duo',
    trio: 'trio',
    squad: 'squad',
} as const

export type SquadType = (typeof SquadType)[keyof typeof SquadType]

export const AccountResponse = z.object({
    result: z.boolean(),
    account_id: z.string().optional(),
    error: z.object({ code: z.string() }).optional(),
})

export type AccountResponse = z.infer<typeof AccountResponse>

export const PlayerStats = z.object({
    placetop1: z.number(),
    kd: z.number(),
    winrate: z.number(),
    placetop3: z.number(),
    placetop5: z.number(),
    placetop6: z.number(),
    placetop10: z.number(),
    placetop12: z.number(),
    placetop25: z.number(),
    kills: z.number(),
    matchesplayed: z.number(),
    minutesplayed: z.number(),
    score: z.number(),
    playersoutlived: z.number(),
    lastmodified: z.number(),
})

export type PlayerStats = z.infer<typeof PlayerStats>

export const StatsByTeamType = z.object({
    trio: PlayerStats,
    duo: PlayerStats,
    solo: PlayerStats,
    squad: PlayerStats,
})

export type StatsByTeamType = z.infer<typeof StatsByTeamType>

export const AccountStatsResponse = z.object({
    result: z.boolean(),
    name: z.string(),
    global_stats: StatsByTeamType,
})

export type AccountStatsResponse = z.infer<typeof AccountStatsResponse>
