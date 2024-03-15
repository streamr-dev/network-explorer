import { CancelToken } from 'axios'

import { get } from '../request'

import { SearchResult } from './streamr'

export const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN

const getPlacesUrl = ({ place }: { place: string }) =>
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=${MAPBOX_TOKEN}`

export type Location = {
  id: string,
  title: string,
  latitude: number
  longitude: number
  isReverseGeoCoded?: true,
}

type GeoCodeResultFeature = {
  id: string
  text: string
  place_type: Array<string>
  place_name: string
  bbox: Array<number>
  center: Array<number>
}

type GeoCodeResult = {
  features: Array<GeoCodeResultFeature>
}

type ReversedGeocodedLocationParams = {
  longitude: number
  latitude: number
}

export const getReversedGeocodedLocation = async ({
  longitude,
  latitude,
}: ReversedGeocodedLocationParams) => {
  let result: GeoCodeResult | undefined

  try {
    result = await get<GeoCodeResult>({
      url: getPlacesUrl({
        place: `${longitude},${latitude}`,
      }),
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to reverse geocode ${longitude},${latitude}`)
  }

  const { place_name: region, bbox } =
    ((result && result.features) || []).find(({ place_type }) => place_type.includes('region')) ||
    {}

  return {
    region,
    bbox,
  }
}

type LocationSearch = {
  search: string
  cancelToken?: CancelToken
}

export const getLocations = async ({
  search,
  cancelToken,
}: LocationSearch): Promise<SearchResult[]> => {
  let result: GeoCodeResult | undefined

  try {
    result = await get<GeoCodeResult>({
      url: getPlacesUrl({
        place: search,
      }),
      options: {
        cancelToken,
      },
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Request failed to find places for ${search}`)
  }

  return ((result && result.features) || [])
    .filter(({ place_type }) => place_type.includes('place'))
    .map(({
      id, text, place_name, center: [longitude, latitude],
    }) => ({
      id,
      name: text,
      description: place_name,
      type: 'locations',
      longitude,
      latitude,
    }))
}
