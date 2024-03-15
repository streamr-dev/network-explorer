import { entropyToMnemonic } from '@ethersproject/hdnode'
import { useInfiniteQuery, useIsFetching, useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import { useMemo } from 'react'
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

interface OperatorNode {
  id: string
  latitude: number
  longitude: number
  name: string
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
            latitude: item.location.latitude,
            longitude: item.location.longitude,
            name: entropyToMnemonic(`0x${item.id}`)
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

interface UseLocationsQueryParams {
  place?: string | [number, number]
}

interface Location {
  description: string
  id: string
  latitude: number
  longitude: number
  name: string
}

export function useLocationsQuery(params: UseLocationsQueryParams) {
  const { place: placeParam = '' } = params

  const place = typeof placeParam === 'string' ? placeParam : placeParam.join(',')

  return useQuery({
    queryKey: ['useLocationsQuery', place],
    queryFn: async ({ signal }) => {
      const result: Location[] = []

      if (!place) {
        return result
      }

      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`,
        { method: 'GET', signal },
      )

      const { features } = await resp.json()

      for (const { place_name: description, ...feature } of features) {
        if (!feature.type.includes('place')) {
          continue
        }

        result.push({
          description,
          id: feature.id,
          latitude: feature.center.latitude,
          longitude: feature.center.longitude,
          name: feature.text,
        })
      }

      return result
    },
    staleTime: Infinity,
  })
}

type SearchResultItem =
  | {
      type: 'node'
      payload: OperatorNode
    }
  | {
      type: 'stream'
      payload: { id: string }
    }
  | { type: 'place'; payload: Location }

export function useSearch({ phrase: phraseParam = '' }) {
  const nodesQuery = useNodesQuery({})

  const phrase = useDebounce(phraseParam.toLowerCase(), 250)

  const { data: nodes } = nodesQuery

  const foundNodes = useMemo<SearchResultItem[]>(() => {
    const matches: SearchResultItem[] = []

    if (nodes && phrase) {
      for (const node of nodes) {
        const { id, name } = node

        if (id.toLowerCase().includes(phrase) || name.toLowerCase().includes(phrase)) {
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

  const locationsQuery = useLocationsQuery({ place: phrase })

  const { data: locations } = locationsQuery

  const foundLocations = useMemo<SearchResultItem[]>(() => {
    if (!locations) {
      return []
    }

    return locations.map((location) => ({
      payload: location,
      type: 'place',
    }))
  }, [locations])

  return [...foundNodes, ...foundLocations]
}
