import { entropyToMnemonic } from '@ethersproject/hdnode'
import { useInfiniteQuery, useIsFetching, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  GetNeighborsDocument,
  GetNeighborsQuery,
  GetNeighborsQueryVariables,
  GetNodesDocument,
  GetNodesQuery,
  GetNodesQueryVariables,
  GetStreamsDocument,
  GetStreamsQuery,
  GetStreamsQueryVariables,
  GetSummaryQuery,
  GetSummaryQueryVariables,
  OrderDirection,
  StreamOrderBy,
} from '../generated/gql/indexer'
import { getIndexerClient } from './queries'
import { Location, OperatorNode, PlaceFeature, PlacesResponse, SearchResultItem } from '../types'

function getSummaryQueryKey() {
  return ['useSummaryQuery'] as const
}

export function useSummaryQuery() {
  return useQuery({
    queryKey: getSummaryQueryKey(),
    queryFn: async () => {
      const {
        data: { summary },
      } = await getIndexerClient().query<GetSummaryQuery, GetSummaryQueryVariables>({
        fetchPolicy: 'network-only',
        query: GetNeighborsDocument,
      })

      const { nodeCount, messagesPerSecond, streamCount } = summary

      return { nodeCount, messagesPerSecond, streamCount }
    },
  })
}

export function useIsFetchingSummary() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getSummaryQueryKey()[0]],
    }) > 0
  )
}

interface UseNodesQueryParams {
  ids?: string[]
}

function getNodesQueryKey({ ids = [] }: UseNodesQueryParams) {
  return ['useNodesQuery', ...ids] as const
}

export function useNodesQuery(params: UseNodesQueryParams) {
  const pageSize = 500

  const { ids } = params

  return useQuery({
    queryKey: getNodesQueryKey(params),
    queryFn: async () => {
      const items: OperatorNode[] = []

      let cursor = '0'

      for (;;) {
        const {
          data: { nodes },
        } = await getIndexerClient().query<GetNodesQuery, GetNodesQueryVariables>({
          fetchPolicy: 'network-only',
          query: GetNodesDocument,
          variables: {
            cursor,
            ids,
            pageSize,
          },
        })

        for (const item of nodes.items) {
          if (!item.location) {
            continue
          }

          items.push({
            id: item.id,
            location: {
              latitude: item.location.latitude,
              longitude: item.location.longitude,
            },
            title: entropyToMnemonic(`0x${item.id}`)
              .match(/(^\w+|\s\w+){3}/)![0]
              .replace(/(^\w|\s\w)/g, (w) => w.toUpperCase()),
          })
        }

        if (!nodes.cursor || nodes.cursor === cursor) {
          break
        }

        cursor = nodes.cursor

        await new Promise<void>((resolve) => {
          setTimeout(resolve, 2000)
        })
      }

      return items
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useIsFetchingNodes() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getNodesQueryKey({})[0]],
    }) > 0
  )
}

interface UseStreamsQueryParams {
  ids?: string[]
  orderBy?: StreamOrderBy
  orderDirection?: OrderDirection
  owner?: string
  pageSize?: number
  searchTerm?: string
}

function getStreamsInfiniteQueryKey(params: UseStreamsQueryParams) {
  const {
    ids = [],
    orderBy = StreamOrderBy.MessagesPerSecond,
    orderDirection = OrderDirection.Asc,
    owner,
    pageSize,
    searchTerm,
  } = params

  return [
    'useStreamsInfiniteQuery',
    pageSize,
    orderBy,
    orderDirection,
    owner,
    searchTerm,
    ...ids,
  ] as const
}

export function useStreamsInfiniteQuery(params: UseStreamsQueryParams) {
  const {
    ids,
    orderBy = StreamOrderBy.MessagesPerSecond,
    orderDirection = OrderDirection.Asc,
    owner,
    pageSize = 10,
    searchTerm,
  } = params

  return useInfiniteQuery({
    queryKey: getStreamsInfiniteQueryKey({
      ids,
      orderBy,
      orderDirection,
      owner,
      pageSize,
      searchTerm,
    }),
    queryFn: async ({ pageParam }) => {
      const result = await getIndexerClient().query<GetStreamsQuery, GetStreamsQueryVariables>({
        fetchPolicy: 'network-only',
        query: GetStreamsDocument,
        variables: {
          cursor: pageParam,
          pageSize,
          orderBy,
          orderDirection,
          owner,
          searchTerm,
          ids,
        },
      })

      const { items, cursor } = result.data.streams

      return {
        cursor: cursor || undefined,
        items: items,
      }
    },
    initialPageParam: '0',
    getNextPageParam: (lastPage) => {
      return lastPage.cursor
    },
  })
}

export function useIsFetchingStreams() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getStreamsInfiniteQueryKey({})[0]],
    }) > 0
  )
}

interface UseNeighborsQueryParams {
  node?: string
  streamPart?: string
}

function getNeighborsQueryKey({ node, streamPart }: UseNeighborsQueryParams) {
  return ['useNeighborsQuery', streamPart, node] as const
}

export function useNeighborsQuery(params: UseNeighborsQueryParams) {
  const pageSize = 500

  const { node, streamPart } = params

  return useQuery({
    queryKey: getNeighborsQueryKey(params),
    queryFn: async () => {
      const items: GetNeighborsQuery['neighbors']['items'] = []

      let cursor = '0'

      for (;;) {
        const {
          data: { neighbors },
        } = await getIndexerClient().query<GetNeighborsQuery, GetNeighborsQueryVariables>({
          fetchPolicy: 'network-only',
          query: GetNeighborsDocument,
          variables: {
            cursor,
            node,
            pageSize,
            streamPart,
          },
        })

        items.push(...neighbors.items)

        if (!neighbors.cursor || neighbors.cursor === cursor) {
          break
        }

        cursor = neighbors.cursor

        console.log('CURSOR', cursor)

        await new Promise<void>((resolve) => {
          setTimeout(resolve, 2000)
        })
      }
    },
  })
}

export function useIsFetchingNeighbors() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getNeighborsQueryKey({})[0]],
    }) > 0
  )
}

export const MapboxToken = process.env.REACT_APP_MAPBOX_TOKEN

interface UseLocationFeaturesQueryParams {
  place?: string | [number, number]
}

interface UseLocationFeaturesQueryOptions<T> {
  transform?: (feature: PlaceFeature) => T
  eligible?: (feature: PlaceFeature) => boolean
}

function useLocationFeaturesQuery<T = PlaceFeature>(
  params: UseLocationFeaturesQueryParams,
  options: UseLocationFeaturesQueryOptions<T> = {},
) {
  const { place: placeParam = '' } = params

  const place = typeof placeParam === 'string' ? placeParam : placeParam.join(',')

  return useQuery({
    queryKey: ['useLocationFeaturesQuery', place],
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

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(
    function updateValueAfterDelay() {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay],
  )

  return debouncedValue
}

export function useSearch({ phrase: phraseParam = '' }) {
  const nodesQuery = useNodesQuery({})

  const phrase = useDebounce(phraseParam.toLowerCase(), 250)

  const { data: nodes } = nodesQuery

  const foundNodes = useMemo<SearchResultItem[]>(() => {
    const matches: SearchResultItem[] = []

    if (nodes && phrase) {
      for (const node of nodes) {
        const { id, title } = node

        if (id.toLowerCase().includes(phrase) || title.toLowerCase().includes(phrase)) {
          matches.push({
            type: 'node',
            payload: node,
          })
        }
      }
    }

    return matches
  }, [nodes, phrase])

  /**
   * @todo Implement stream search.
   */

  const locationsQuery = useLocationFeaturesQuery(
    { place: phrase },
    {
      eligible: ({ type }) => type.includes('place'),
      transform: ({
        id,
        text: name,
        place_name: description,
        center: [latitude, longitude],
      }): Location => ({
        description,
        id,
        latitude,
        longitude,
        name,
      }),
    },
  )

  const { data: locations } = locationsQuery

  const foundLocations = useMemo<SearchResultItem[]>(() => {
    if (!locations) {
      return []
    }

    return locations.map((location) => ({
      payload: location,
      type: 'location',
    }))
  }, [locations])

  return [...foundNodes, ...foundLocations]
}
