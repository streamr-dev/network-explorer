import { useIsFetching, useQuery } from '@tanstack/react-query'
import { MapboxToken } from '../consts'
import { PlaceFeature, PlacesResponse } from '../types'
import { useStore } from '../Store'

interface UseLocationFeaturesQueryParams {
  place?: string | [number, number]
}

interface UseLocationFeaturesQueryOptions<T> {
  transform?: (feature: PlaceFeature) => T
  eligible?: (feature: PlaceFeature) => boolean
}

function getLocationFeaturesQueryKey(place: string, chainId: number) {
  return ['useLocationFeaturesQuery', place, chainId]
}

export function useLocationFeaturesQuery<T = PlaceFeature>(
  params: UseLocationFeaturesQueryParams,
  options: UseLocationFeaturesQueryOptions<T> = {},
) {
  const { place: placeParam = '' } = params
  const { chainId } = useStore()

  const place = typeof placeParam === 'string' ? placeParam : placeParam.join(',')

  return useQuery({
    queryKey: getLocationFeaturesQueryKey(place, chainId),
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
  const { chainId } = useStore()
  const queryCount = useIsFetching({
    exact: true,
    queryKey: getLocationFeaturesQueryKey(place, chainId),
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
    { place: [longitude, latitude] },
    {
      eligible: ({ place_type }) => place_type.includes('region'),
      transform: ({ bbox, place_name: region }) => ({ bbox, region }),
    },
  )
}

export function useIsFetchingLocationRegions({ longitude, latitude }: UseLocationRegionParams) {
  return useIsFetchingLocationFeatures(`${longitude},${latitude}`)
}
