import { useIsFetching, useQuery } from '@tanstack/react-query'
import { PlaceFeature, PlacesResponse } from '../types'

export const MapboxToken = process.env.REACT_APP_MAPBOX_TOKEN

interface UseLocationFeaturesQueryParams {
  place?: string | [number, number]
}

interface UseLocationFeaturesQueryOptions<T> {
  transform?: (feature: PlaceFeature) => T
  eligible?: (feature: PlaceFeature) => boolean
}

function getLocationFeaturesQueryKey(place: string) {
  return ['useLocationFeaturesQuery', place]
}

export function useLocationFeaturesQuery<T = PlaceFeature>(
  params: UseLocationFeaturesQueryParams,
  options: UseLocationFeaturesQueryOptions<T> = {},
) {
  const { place: placeParam = '' } = params

  const place = typeof placeParam === 'string' ? placeParam : placeParam.join(',')

  return useQuery({
    queryKey: getLocationFeaturesQueryKey(place),
    queryFn: async ({ signal }) => {
      const result: T[] = []

      if (!place) {
        return result
      }

      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=${MapboxToken}`,
        { method: 'GET', signal },
      )

      const response: PlacesResponse = await resp.json()

      for (const feature of response.features) {
        if (options.eligible && !options.eligible(feature)) {
          continue
        }

        if (!options.transform) {
          result.push(feature as T)

          continue
        }

        result.push(options.transform(feature))
      }

      return result
    },
    staleTime: Infinity,
  })
}

export function useIsFetchingLocationFeatures(place: string) {
  const queryCount = useIsFetching({
    exact: true,
    queryKey: getLocationFeaturesQueryKey(place),
  })

  return queryCount > 0
}

interface UseLocationRegionParams {
  latitude: number
  longitude: number
}

export function useLocationRegionsQuery(params: UseLocationRegionParams) {
  const { latitude, longitude } = params

  return useLocationFeaturesQuery(
    { place: [latitude, longitude] },
    {
      eligible: ({ type }) => type.includes('region'),
      transform: ({ bbox, place_name: region }) => ({ bbox, region }),
    },
  )
}
