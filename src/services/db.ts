import { MongoClient, ServerApiVersion } from 'mongodb'
import { AccountStatsResponse } from './fortniteApi.js'

if (!process.env.DB_SECRET) {
    throw new Error('Missing DB_SECRET')
}

const uri = `mongodb+srv://${process.env.DB_SECRET}@cluster0.ufb6w5x.mongodb.net/?retryWrites=true&w=majority`

export const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

export type Challenge = {
    chat_id: number
    players: Player[]
    history: StatsSnapshot[]
    instruction_for_narrative?: string
}

export type Player = {
    username: string
    platform: string
    account_id: string
}

export type StatsSnapshot = {
    created_at: string
    players_stats: Array<{
        account_id: string
        stat: AccountStatsResponse
    }>
}

export async function upsertChallenge(challenge: Challenge) {
    try {
        await client.connect()
        const database = client.db('challengesDb')
        const challenges = database.collection('challenges')

        const query = { chat_id: challenge.chat_id }

        const replacement = challenge
        const result = await challenges.replaceOne(query, replacement, {
            upsert: true,
        })
        return result.upsertedId
    } finally {
        await client.close()
    }
}

export async function getChallenge(chatId: number) {
    try {
        await client.connect()
        const database = client.db('challengesDb')
        const challenges = database.collection('challenges')

        const query = { chat_id: chatId }

        const result = await challenges.findOne<Challenge>(query)
        return result
    } finally {
        await client.close()
    }
}
