type AccessorFunction<T> = (item: T) => number

export type WithPlace<T> = { player: T; place: number }

export function assignPlaces<T>(
    players: T[],
    accessor: AccessorFunction<T>
): WithPlace<T>[] {
    const playerPlaces = [...players]
        .sort((a, b) => accessor(b) - accessor(a))
        .map((player) => ({ player, place: 0 }))

    let prevPlace = 0
    let prevScore: number | null = null

    for (let i = 0; i < playerPlaces.length; i++) {
        const playerPlace = playerPlaces[i]!
        const score = accessor(playerPlace.player)

        if (score !== prevScore) {
            prevPlace++
            prevScore = score
        }

        playerPlace.place = prevPlace
    }

    return playerPlaces
}
