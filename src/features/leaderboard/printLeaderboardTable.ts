import { WithPlace } from '../../utils/assignPlaces.js'
import { Score } from './getScores.js'
import { table, getBorderCharacters } from 'table'

export function printLeaderboardTable(scores: WithPlace<Score>[]) {
    return table(
        [
            ['', '', '🔫', '🎮'],
            ...scores.map(({ place, player }) => [
                place,
                player.username,
                player.kills,
                player.matchesplayed,
            ]),
        ],
        {
            border: getBorderCharacters('void'),
            singleLine: true,
            columns: [
                { alignment: 'left', width: 3 },
                { alignment: 'left', width: 15 },
                { alignment: 'right', width: 3 },
                { alignment: 'right', width: 3 },
            ],
        }
    )
}
