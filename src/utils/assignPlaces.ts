export function assignPlaces<T>(objects: T[], accessor: (obj: T) => number) {
    const places: { item: T; place: number }[] = []

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i]!
        let place = places.findIndex(
            (placeObject) => accessor(placeObject.item) === accessor(object)
        )

        if (place === -1) {
            place = places.length
        }

        places.push({ item: object, place })
    }

    places.forEach((place) => {
        place.place++
    })

    return places
}
